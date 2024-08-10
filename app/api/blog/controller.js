"use strict";
import slugify from "slugify";
import table from "../../db/models.js";

const create = async (req, res) => {
  try {
    req.body.slug = slugify(req.body.slug ? req.body.slug : req.body.title);
    res.send(await table.BlogModel.create(req));
  } catch (error) {
    console.error(error);
    res.code(500).send({ message: error.message, error });
  }
};

const update = async (req, res) => {
  try {
    const record = await table.BlogModel.getById(req);
    if (!record) return res.code(404).send({ message: "Blog not found!" });

    console.log(req.body);

    req.body.slug = slugify(req.body.slug ? req.body.slug : req.body.title);
    res.send(await table.BlogModel.update(req));
  } catch (error) {
    console.error(error);
    res.code(500).send({ message: error.message, error });
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.BlogModel.getById(req);
    if (!record) return res.code(404).send({ message: "Blog not found!" });

    res.send(record);
  } catch (error) {
    console.error(error);
    res.code(500).send({ message: error.message, error });
  }
};

const getBySlug = async (req, res) => {
  try {
    const record = await table.BlogModel.getBySlug(req);
    if (!record) return res.code(404).send({ message: "Blog not found!" });

    res.send(record);
  } catch (error) {
    console.error(error);
    res.code(500).send({ message: error.message, error });
  }
};

const getRelatedBlogs = async (req, res) => {
  try {
    const record = await table.BlogModel.getById(req);
    if (!record) return res.code(404).send({ message: "Blog not found!" });

    console.log({ blogs: await table.BlogModel.getRelatedBlogs(req) });

    res.send(await table.BlogModel.getRelatedBlogs(req));
  } catch (error) {
    console.error(error);
    res.code(500).send({ message: error.message, error });
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.BlogModel.getById(req);
    if (!record) return res.code(404).send({ message: "Blog not found!" });

    res.send(await table.BlogModel.deleteById(req));
  } catch (error) {
    console.error(error);
    res.code(500).send({ message: error.message, error });
  }
};

const get = async (req, res) => {
  try {
    res.send(await table.BlogModel.get(req));
  } catch (error) {
    console.error(error);
    res.code(500).send({ message: error.message, error });
  }
};

export default {
  create: create,
  update: update,
  getById: getById,
  getBySlug: getBySlug,
  deleteById: deleteById,
  get: get,
  getRelatedBlogs: getRelatedBlogs,
};
