"use strict";

import hash from "../../lib/encryption/index.js";

import table from "../../db/models.js";
import authToken from "../../helpers/auth.js";

const verifyUserCredentials = async (req, res) => {
  let userData;

  try {
    userData = await table.UserModel.getByUsername(req);
  } catch (error) {
    console.log(error);
    return res.send(error);
  }

  if (!userData) {
    return res.code(404).send({ message: "User not found!" });
  }

  let passwordIsValid = await hash.verify(req.body.password, userData.password);

  if (!passwordIsValid) {
    return res.code(401).send({
      message: "Invalid credentials",
    });
  }

  const [jwtToken, expiresIn] = authToken.generateAccessToken(userData);
  const refreshToken = authToken.generateRefreshToken(userData);

  return res.send({
    token: jwtToken,
    expire_time: Date.now() + expiresIn,
    refresh_token: refreshToken,
    user_data: userData,
  });
};

const createNewUser = async (req, res) => {
  let userData;
  try {
    userData = await table.UserModel.getByUsername(req);
    if (userData) {
      return res
        .code(403)
        .send({ message: "User with this username already exists." });
    }

    await table.UserModel.create(req);

    return res.send({
      message: "User created successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.send(error);
  }
};

const verifyRefreshToken = async (req, res) => {
  return authToken.verifyRefreshToken(req, res);
};

export default {
  verifyUserCredentials,
  createNewUser,
  verifyRefreshToken,
};
