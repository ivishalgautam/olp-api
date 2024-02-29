"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let BannerModel = null;

const init = async (sequelize) => {
  BannerModel = sequelize.define(
    constants.models.BANNER_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
        unique: true,
      },
      type: {
        type: sequelizeFwk.DataTypes.ENUM("featured", "top-selling", "main"),
        allowNull: false,
      },
      name: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: sequelizeFwk.DataTypes.JSONB,
        allowNull: false,
      },
    },
    { createdAt: "created_at", updatedAt: "updated_at" }
  );

  await BannerModel.sync({ alter: true });
};

const create = async (req) => {
  return await BannerModel.create({
    type: req.body.type,
    image: req.body.image,
    name: req.body.name,
    slug: req.body.slug,
  });
};

const get = async (req) => {
  return await BannerModel.findAll({
    order: [["created_at", "DESC"]],
  });
};

const update = async (req, id) => {
  const [rowCount, rows] = await BannerModel.update(
    {
      type: req.body.type,
      image: req.body.image,
      name: req.body.name,
      slug: req.body.slug,
    },
    {
      where: {
        id: req.params.id || id,
      },
      returning: true,
      raw: true,
    }
  );

  return rows[0];
};

const getById = async (req, id) => {
  return await BannerModel.findOne({
    where: {
      id: req.params.id || id,
    },
  });
};

const getBySlug = async (req, slug) => {
  return await BannerModel.findOne({
    where: {
      slug: req.params.slug || slug,
    },
    raw: true,
  });
};

const deleteById = async (req, id) => {
  return await BannerModel.destroy({
    where: { id: req.params.id || id },
  });
};

export default {
  init: init,
  create: create,
  get: get,
  update: update,
  getById: getById,
  getBySlug: getBySlug,
  deleteById: deleteById,
};
