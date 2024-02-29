"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";
import fileController from "../upload_files/controller.js";
import slugify from "slugify";

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = constants.http.status;

const create = async (req, res) => {
  try {
    let slug = slugify(req.body.name, { lower: true });
    req.body.slug = slug;
    res.send(await table.BannerModel.create(req));
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const updateById = async (req, res) => {
  try {
    const record = await table.BannerModel.getById(req, req.params.id);
    if (!record) {
      return res.code(NOT_FOUND).send({ message: "Banner not found!" });
    }

    let slug = slugify(req.body.name, { lower: true });
    req.body.slug = slug;

    res.send(await table.BannerModel.update(req));
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.BannerModel.getById(req, req.params.id);
    if (!record) {
      return res.code(NOT_FOUND).send({ message: "Banner not found!" });
    }

    res.send(await table.BannerModel.getById(req));
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const get = async (req, res) => {
  try {
    res.send(await table.BannerModel.get(req));
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.BannerModel.getById(req, req.params.id);
    if (!record) {
      return res.code(NOT_FOUND).send({ message: "Banner not found!" });
    }

    res.send(await table.BannerModel.deleteById(req, req.params.id));
    req.query.file_path = record?.image;
    fileController.deleteFile(req, res);
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

export default {
  create: create,
  updateById: updateById,
  getById: getById,
  get: get,
  deleteById: deleteById,
};
