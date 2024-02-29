"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";

let ProductModel = null;

const init = async (sequelize) => {
  ProductModel = sequelize.define(
    constants.models.PRODUCT_TABLE,
    {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      pictures: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        default: [],
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        default: [],
      },
      type: {
        type: DataTypes.ENUM,
        values: ["genuine", "aftermarket", "oem"],
        allowNull: false,
      },
      sku: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      brand_id: {
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: "CASCADE",
        references: {
          model: constants.models.BRAND_TABLE,
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: "CASCADE",
        references: {
          model: constants.models.CATEGORY_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      status: {
        type: DataTypes.ENUM("published", "draft", "pending"),
        defaultValue: "pending",
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        deafaultValue: false,
      },
      related_products: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        deafaultValue: [],
      },
      meta_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      meta_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await ProductModel.sync({ alter: true });
};

const create = async (req) => {
  // return console.log({ body: req.body });
  return await ProductModel.create({
    title: req.body.title,
    slug: req.body.slug,
    description: req.body.description,
    pictures: req.body.pictures,
    tags: req.body.tags,
    type: req.body.type,
    sku: req.body.sku,
    brand_id: req.body.brand_id,
    category_id: req.body.category_id,
    status: req.body.status,
    is_featured: req.body.is_featured,
    related_products: req.body.related_products,
    meta_title: req.body.meta_title,
    meta_description: req.body.meta_description,
  });
};

const get = async (req) => {
  let whereQuery = ``;

  let query = `
        SELECT
          prd.*,
          cat.name as category_name
        FROM
          products prd
        LEFT JOIN categories cat ON cat.id = prd.category_id
        ${whereQuery};
`;
  return await ProductModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true,
  });
};

const updateById = async (req, id) => {
  const [rowCount, rows] = await ProductModel.update(
    {
      title: req.body.title,
      slug: req.body.slug,
      description: req.body.description,
      pictures: req.body.pictures,
      tags: req.body.tags,
      type: req.body.type,
      sku: req.body.sku,
      brand_id: req.body.brand_id,
      category_id: req.body.category_id,
      status: req.body.status,
      is_featured: req.body.is_featured,
      related_products: req.body.related_products,
      meta_title: req.body.meta_title,
      meta_description: req.body.meta_description,
    },
    {
      where: { id: req.params.id || id },
      returning: true,
      raw: true,
    }
  );

  return rows[0];
};

const getById = async (req, id) => {
  let query = `
        SELECT
          *
        FROM products 
        WHERE id = '${req.params.id || id}';
`;

  return await ProductModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    plain: true,
  });
};

const getBySlug = async (req, slug) => {
  let query = `
      SELECT
        prd.*,
        cat.name as category_name
      FROM
        products prd
      LEFT JOIN categories cat ON cat.id = prd.category_id
      WHERE prd.slug = '${req.params.slug || slug}';
`;
  return await ProductModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    plain: true,
  });
};

const deleteById = async (req, id) => {
  return await ProductModel.destroy({
    where: {
      id: req.params.id || id,
    },
  });
};

const publishProductById = async (id, value) => {
  const [rowCount, rows] = await ProductModel.update(
    {
      status: value,
    },
    {
      where: {
        id: id,
      },
      returning: true,
      plain: true,
      raw: true,
    }
  );

  return rows;
};

export default {
  init: init,
  create: create,
  get: get,
  updateById: updateById,
  getById: getById,
  getBySlug: getBySlug,
  deleteById: deleteById,
  publishProductById: publishProductById,
};
