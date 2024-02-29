"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk from "sequelize";

let CategoryModel = null;

const init = async (sequelize) => {
  CategoryModel = sequelize.define(
    constants.models.CATEGORY_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
        unique: true,
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
        type: sequelizeFwk.DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await CategoryModel.sync({ alter: true });
};

const create = async (req) => {
  return await CategoryModel.create({
    name: req.body.name,
    image: req.body.image,
    slug: req.body.slug,
  });
};

const get = async (req) => {
  return await CategoryModel.findAll({
    order: [["created_at", "DESC"]],
  });
};

const update = async (req, id) => {
  const [rowCount, rows] = await CategoryModel.update(
    {
      name: req.body.name,
      image: req.body.image,
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
  return await CategoryModel.findOne({
    where: {
      id: req.params.id || id,
    },
  });
};

const getBySlug = async (req, slug) => {
  return await CategoryModel.findOne({
    where: {
      slug: req.params.slug || slug,
    },
    raw: true,
  });
};

const deleteById = async (req, id) => {
  return await CategoryModel.destroy({
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
