"use strict";

import table from "../../db/models.js";
import hash from "../../lib/encryption/index.js";
import ejs from "ejs";
import fs from "fs";
import path from "path";
import { sendCredentials } from "../../helpers/mailer.js";
import { fileURLToPath } from "url";
import authToken from "../../helpers/auth.js";
import crypto from "crypto";
import { sendOtp } from "../../helpers/interaktApi.js";

const create = async (req, res) => {
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
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

const update = async (req, res) => {
  try {
    console.log(req.body);
    const record = await table.UserModel.getById(req);
    if (!record) {
      return res.code(404).send({ status: false, message: "User not exists" });
    }

    const user = await table.UserModel.update(req);

    if (user && req.body.password) {
      req.body.new_password = req.body.password;
      await table.UserModel.updatePassword(req, req.user_data.id);
    }
    return res.send({ status: true, message: "Updated" });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

const updateStatus = async (req, res) => {
  try {
    const record = await table.UserModel.getById(req);
    if (!record) {
      return res.code(404).send({ status: false, message: "User not exists" });
    }
    const data = await table.UserModel.updateStatus(
      req.params.id,
      req.body.is_active
    );

    if (data.is_active) {
      // Read the email template file
      const emailTemplatePath = path.join(
        fileURLToPath(import.meta.url),
        "..",
        "..",
        "..",
        "..",
        "views",
        "credentials.ejs"
      );
      const emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");

      // Render the email template with user data
      const template = ejs.render(emailTemplate, {
        fullname: `${data.first_name} ${data.last_name}`,
        username: data.username,
        password: 1234,
      });

      await sendCredentials(template, data?.email);
    }

    res.send({
      status: true,
      message: data?.is_active ? "Customer Active." : "Customer Inactive.",
    });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.UserModel.deleteById(req);
    if (record === 0) {
      return res.code(404).send({ status: false, message: "User not exists" });
    }

    return res.send({ status: true, data: record });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

const get = async (req, res) => {
  try {
    return res.send({ status: true, data: await table.UserModel.get() });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.UserModel.getById(req);
    if (!record) {
      return res.code(404).send({ status: false, message: "User not exists" });
    }
    delete record.password;

    return res.send({ status: true, record });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

const updatePassword = async (req, res) => {
  try {
    const record = await table.UserModel.getById(req);

    if (!record) {
      return res.code(404).send({ status: false, message: "User not exists" });
    }

    const verify_old_password = await hash.verify(
      req.body.old_password,
      record.password
    );

    if (!verify_old_password) {
      return res
        .code(404)
        .send({ message: "Incorrect password. Please enter a valid password" });
    }

    await table.UserModel.updatePassword(req);
    return res.send({
      status: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

const checkUsername = async (req, res) => {
  try {
    const user = await table.UserModel.getByUsername(req);
    if (user) {
      return res.code(409).send({
        status: false,
        message: "username already exists try with different username",
      });
    }
    return res.send({
      status: true,
    });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

const getUser = async (req, res) => {
  try {
    const record = await table.UserModel.getById(undefined, req.user_data.id);
    if (!record) {
      return res.code(401).send({ status: false, messaege: "invalid token" });
    }

    return res.send(req.user_data);
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = await table.UserModel.getByResetToken(req);
    if (!token) {
      return res.code(401).send({ status: false, message: "invalid url" });
    }

    await table.UserModel.updatePassword(req, token.id);
    return res.send({
      status: true,
      message: "Password reset successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.code(500).send({ status: false, error });
  }
};
export default {
  create: create,
  update: update,
  deleteById: deleteById,
  get: get,
  getById: getById,
  checkUsername: checkUsername,
  updatePassword: updatePassword,
  getUser: getUser,
  resetPassword: resetPassword,
  updateStatus: updateStatus,
};
