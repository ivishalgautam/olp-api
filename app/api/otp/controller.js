"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";
import moment from "moment";
import crypto from "crypto";
import axios from "axios";

const create = async (req, res) => {
  // console.log(req.decoded.user.id);
  try {
    const user = await table.UserModel.getById(
      req,
      req.user_data?.id || req.decoded.user.id
    );
    const otp = crypto.randomInt(100000, 999999);
    const record = await table.OtpModel.getByUserId(user?.id);
    console.log({ user, otp, record });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.interakt.ai/v1/public/message/",
      headers: {
        Authorization: `Basic ${process.env.INTERACT_API_KEY}`,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        countryCode: user.country_code,
        phoneNumber: user.mobile_number,
        callbackData: "Otp sent successfully.",
        type: "Template",
        template: {
          name: process.env.INTERACT_TEMPLATE_NAME,
          languageCode: "en",
          bodyValues: [`${user.first_name} ${user.last_name}`, otp],
        },
      }),
    };

    const resp = await axios(config);
    if (resp.data.result) {
      if (record) {
        await table.OtpModel.update({
          user_id: req.user_data?.id || req.decoded.user.id,
          otp: otp,
        });
      } else {
        await table.OtpModel.create({
          user_id: req.user_data?.id || req.decoded.user.id,
          otp: otp,
        });
      }
    }

    res.send({ message: "Otp sent" });
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const verify = async (req, res) => {
  try {
    const record = await table.OtpModel.getByUserId(
      req.user_data?.id || req.decoded.user.id
    );

    if (!record) {
      return res
        .code(constants.http.status.NOT_FOUND)
        .send({ message: "OTP not found!" });
    }

    const isExpired = moment(record.created_at).add(5, "minutes").isBefore();
    if (isExpired) {
      await table.OtpModel.deleteByUserId(
        req.user_data?.id || req.decoded.user.id
      );
      return res.code(400).send({ message: "Please resend OTP!" });
    }

    if (record.otp != req.params.otp) {
      return res.code(400).send({ message: "Incorrect otp!" });
    }

    await table.OtpModel.deleteByUserId(
      req.user_data?.id || req.decoded.user.id
    );

    await table.UserModel.verify({
      user_id: req.user_data?.id || req.decoded.user.id,
      status: true,
    });

    res.send({ message: "Otp verified." });
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

export default {
  create: create,
  verify: verify,
};
