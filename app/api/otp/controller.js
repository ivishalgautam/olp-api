"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";
import moment from "moment";

const create = async (req, res) => {
  try {
    const otp = 111111;
    const record = await table.OtpModel.getByUserId(req.user_data.id);

    if (record) {
      await table.OtpModel.update({ user_id: req.user_data.id, otp: otp });
    } else {
      await table.OtpModel.create({
        user_id: req.user_data.id,
        otp: otp,
      });
    }
    res.send({ message: "Otp sent" });
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const verify = async (req, res) => {
  try {
    const record = await table.OtpModel.getByUserId(req.user_data.id);

    if (!record) {
      return res
        .code(constants.http.status.NOT_FOUND)
        .send({ message: "Please resend OTP!" });
    }

    const isExpired = moment(record.created_at).add(5, "minutes").isBefore();
    if (isExpired) {
      await table.OtpModel.deleteByUserId(req.user_data.id);
      return res.code(400).send({ message: "Please resend OTP!" });
    }

    if (record.otp != req.params.otp) {
      return res.code(400).send({ message: "Incorrect otp!" });
    }

    await table.OtpModel.deleteByUserId(req.user_data.id);

    await table.UserModel.verify({
      user_id: req.user_data.id,
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
