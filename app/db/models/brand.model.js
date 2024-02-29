"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, QueryTypes, Deferrable } from "sequelize";

let BrandModel = null;

const init = async (sequelize) => {
  BrandModel = sequelize.define(
    constants.models.BRAND_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await BrandModel.sync({ alter: true });
};

const create = async (req) => {
  return await BrandModel.create({
    name: req.body.name,
    slug: req.body.slug,
  });
};

const get = async (req) => {
  return await BrandModel.findAll({
    order: [["created_at", "DESC"]],
  });
};

const update = async (req, id) => {
  const [rowCount, rows] = await BrandModel.update(
    {
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
  return await BrandModel.findOne({
    where: {
      id: req.params.id || id,
    },
  });
};

const getBySlug = async (req, slug) => {
  return await BrandModel.findOne({
    where: {
      slug: req.params.slug || slug,
    },
    raw: true,
  });
};

const deleteById = async (req, id) => {
  return await BrandModel.destroy({
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
