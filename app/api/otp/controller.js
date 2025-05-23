"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";
import moment from "moment";
import crypto from "crypto";
// import { sendOtp } from "../../helpers/interaktApi.js";
import { fileURLToPath } from "url";
import ejs from "ejs";
import fs from "fs";
import path from "path";
import { sendCredentials } from "../../helpers/mailer.js";

const create = async (req, res) => {
  try {
    const user = await table.UserModel.getByPhone(req, req.body.phone);

    const otp = crypto.randomInt(100000, 999999);
    const record = await table.OtpModel.getByPhone(req.body.phone);

    if (record) {
      await table.OtpModel.update({
        phone: req.body.phone,
        otp: otp,
      });
    } else {
      await table.OtpModel.create({
        phone: req.body.phone,
        otp: otp,
      });
    }

    const otpSendTemplate = path.join(
      fileURLToPath(import.meta.url),
      "..",
      "..",
      "..",
      "..",
      "views",
      "otp.ejs"
    );
    const otpTemplate = fs.readFileSync(otpSendTemplate, "utf-8");

    const template = ejs.render(otpTemplate, {
      fullname: `${user.first_name} ${user.last_name ?? ""}`,
      otp: otp,
    });

    await sendCredentials(template, user.email, "OTP");

    // const resp = await sendOtp({
    //   country_code: user.country_code,
    //   first_name: user.first_name,
    //   last_name: user.last_name,
    //   mobile_number: user.mobile_number,
    //   otp: otp,
    // });

    res.send({ status: true, message: "Otp sent please check your mail." });
  } catch (error) {
    console.error(error);
    res.code(500).send({ status: false, error });
  }
};

const verify = async (req, res) => {
  try {
    const record = await table.OtpModel.getByPhone(req.body.phone);

    if (!record) {
      return res.code(404).send({ message: "OTP not found!" });
    }

    const isExpired = moment(record.created_at).add(5, "minutes").isBefore();
    if (isExpired) {
      await table.OtpModel.deleteByPhone(req.body.phone);
      return res
        .code(400)
        .send({ status: false, message: "Please resend OTP!" });
    }

    if (record.otp != req.body.otp) {
      return res.code(400).send({ status: false, message: "Incorrect otp!" });
    }

    await table.OtpModel.deleteByPhone(req.body.phone);

    const user = await table.UserModel.verify(req.body.phone);

    res.send({
      status: true,
      message: "Otp verified.",
      is_active: user.is_active,
    });
  } catch (error) {
    console.error(error);
    res.code(500).send({ status: false, error });
  }
};

export default {
  create: create,
  verify: verify,
};
