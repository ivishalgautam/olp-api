"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";
import { fileURLToPath } from "url";
import ejs from "ejs";
import fs from "fs";
import path from "path";
import { sendCredentials } from "../../helpers/mailer.js";

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = constants.http.status;

const create = async (req, res) => {
  try {
    await table.RegistrationModel.create(req);

    const registrationTemplate = path.join(
      fileURLToPath(import.meta.url),
      "..",
      "..",
      "..",
      "..",
      "views",
      "registration-query.ejs"
    );
    const emailTemplate = fs.readFileSync(registrationTemplate, "utf-8");
    const template = ejs.render(emailTemplate, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      industry: req.body.industry,
    });
    await sendCredentials(template, process.env.SMTP_EMAIL);

    res.send({ status: true, message: "Signed up successfully." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.RegistrationModel.getById(req, req.params.id);

    if (!record) {
      return res
        .code(NOT_FOUND)
        .send({ status: false, message: "Registeration not found!" });
    }

    res.send({ status: true, data: record });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const get = async (req, res) => {
  try {
    const queries = await table.RegistrationModel.get(req);
    res.send({ status: true, data: queries });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.RegistrationModel.getById(req, req.params.id);

    if (!record)
      return res
        .code(NOT_FOUND)
        .send({ status: false, message: "Registeration not found!" });

    await table.RegistrationModel.deleteById(req, req.params.id);
    res.send({ status: true, message: "Registeration deleted." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

export default {
  create: create,
  get: get,
  deleteById: deleteById,
  getById: getById,
};
