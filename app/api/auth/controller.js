"use strict";

import hash from "../../lib/encryption/index.js";

import table from "../../db/models.js";
import authToken from "../../helpers/auth.js";
import crypto from "crypto";
import { sendOtp } from "../../helpers/interaktApi.js";

const verifyUserCredentials = async (req, res) => {
  let userData;
  try {
    userData = await table.UserModel.getByUsername(req);

    if (!userData) {
      return res.code(404).send({ message: "User not found!" });
    }

    if (!userData.is_active) {
      return res
        .code(400)
        .send({ message: "User not active. Please contact administrator!" });
    }

    let passwordIsValid = await hash.verify(
      req.body.password,
      userData.password
    );

    if (!passwordIsValid) {
      return res.code(400).send({
        message: "Invalid credentials",
      });
    }

    const [jwtToken, expiresIn] = authToken.generateAccessToken(userData);
    const refreshToken = authToken.generateRefreshToken(userData);

    return res.send({
      status: true,
      token: jwtToken,
      expire_time: Date.now() + expiresIn,
      refresh_token: refreshToken,
      user_data: userData,
    });
  } catch (error) {
    console.log(error);
    return res.code(500).send({ status: false, error });
  }
};

const createNewUser = async (req, res) => {
  let userData;
  try {
    const record = await table.UserModel.getByUsername(req);

    if (record) {
      return res.code(409).send({
        status: false,
        message:
          "User already exists with username. Please try with different username",
      });
    }

    const otp = crypto.randomInt(100000, 999999);
    const data = await table.UserModel.create(req);

    const userData = await table.UserModel.getById(req, data.dataValues.id);

    const resp = await sendOtp({
      country_code: userData?.country_code,
      mobile_number: userData?.mobile_number,
      first_name: userData?.first_name,
      last_name: userData?.last_name,
      otp,
    });

    if (resp.data.result) {
      await table.OtpModel.create({
        user_id: data.dataValues.id,
        otp: otp,
      });
    }

    const [jwtToken, expiresIn] = authToken.generateAccessToken(userData);
    const refreshToken = authToken.generateRefreshToken(userData);

    return res.send({
      status: true,
      token: jwtToken,
      expire_time: Date.now() + expiresIn,
      refresh_token: refreshToken,
      user_data: userData,
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const verifyRefreshToken = async (req, res) => {
  // console.log({ cookies: req.cookies });
  return authToken.verifyRefreshToken(req, res);
};

export default {
  verifyUserCredentials,
  createNewUser,
  verifyRefreshToken,
};
