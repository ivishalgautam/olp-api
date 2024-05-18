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
      title: { type: DataTypes.STRING, allowNull: false },
      slug: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      description: { type: DataTypes.TEXT, allowNull: true },
      custom_description: { type: DataTypes.JSONB, defaultValue: "[]" },
      pictures: { type: DataTypes.ARRAY(DataTypes.TEXT), default: [] },
      tags: { type: DataTypes.ARRAY(DataTypes.STRING), default: [] },
      type: {
        type: DataTypes.ENUM,
        values: ["genuine", "aftermarket", "oem"],
        allowNull: false,
      },
      sku: { type: DataTypes.STRING, allowNull: false },
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
      is_featured: { type: DataTypes.BOOLEAN, deafaultValue: false },
      related_products: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        deafaultValue: [],
      },
      meta_title: { type: DataTypes.STRING, allowNull: false },
      meta_description: { type: DataTypes.TEXT, allowNull: false },
    },
    { createdAt: "created_at", updatedAt: "updated_at" }
  );

  await ProductModel.sync({ alter: true });
};

const create = async (req) => {
  return await ProductModel.create({
    title: req.body.title,
    slug: req.body.slug,
    description: req.body.description,
    custom_description: req.body.custom_description,
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
  let whereConditions = [];
  const queryParams = {};

  if (req.query.type) {
    whereConditions.push(`prd.type = :type`);
    queryParams.type = req.query.type;
  }

  if (req.query.featured) {
    whereConditions.push(`prd.is_featured = true`);
  }

  // const part = req.query.part;
  const categories = req.query.categories;
  const brands = req.query.brands;

  if (categories) {
    const categorySlugs = categories.split("_");
    const categoryPlaceholders = categorySlugs
      .map((_, index) => `:category${index}`)
      .join(", ");
    whereConditions.push(`cat.slug IN (${categoryPlaceholders})`);
    categorySlugs.forEach((slug, index) => {
      queryParams[`category${index}`] = slug;
    });
  }
  if (brands) {
    const brandSlugs = brands.split("_");
    const brandPlaceholders = brandSlugs
      .map((_, index) => `:brand${index}`)
      .join(", ");
    whereConditions.push(`brd.slug IN (${brandPlaceholders})`);
    brandSlugs.forEach((slug, index) => {
      queryParams[`brand${index}`] = slug;
    });
  }

  let whereClause = "";
  if (whereConditions.length > 0) {
    whereClause = "WHERE " + whereConditions.join(" AND ");
  }

  const page = req.query.page ? Math.max(1, parseInt(req.query.page)) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const offset = (page - 1) * limit;

  const query = `
    SELECT
      prd.*,
      cat.name AS category_name,
      cat.slug AS category_slug,
      brd.name AS brand_name,
      brd.slug AS brand_slug
    FROM
      products prd
      LEFT JOIN categories cat ON cat.id = prd.category_id
      LEFT JOIN brands brd ON brd.id = prd.brand_id
    ${whereClause}
    ORDER BY prd.updated_at DESC
    LIMIT :limit OFFSET :offset;
  `;

  const products = await ProductModel.sequelize.query(query, {
    replacements: { ...queryParams, limit, offset },
    type: QueryTypes.SELECT,
    raw: true,
  });

  const countQuery = `
    SELECT COUNT(prd.id) AS total
    FROM products prd
    LEFT JOIN categories cat ON cat.id = prd.category_id
    LEFT JOIN brands brd ON brd.id = prd.brand_id
    ${whereClause};
  `;

  const [{ total }] = await ProductModel.sequelize.query(countQuery, {
    replacements: queryParams,
    type: QueryTypes.SELECT,
    raw: true,
  });

  return {
    data: products,
    total_page: Math.ceil(Number(total) / Number(limit)),
    page: page,
  };
};

const updateById = async (req, id) => {
  console.log(req.body);
  // bdhdvd
  const [rowCount, rows] = await ProductModel.update(
    {
      title: req.body?.title,
      slug: req.body?.slug,
      description: req.body?.description,
      custom_description: req.body?.custom_description,
      pictures: req.body?.pictures,
      tags: req.body?.tags,
      type: req.body?.type,
      sku: req.body?.sku,
      brand_id: req.body?.brand_id,
      category_id: req.body?.category_id,
      status: req.body?.status,
      is_featured: req.body?.is_featured,
      related_products: req.body?.related_products,
      meta_title: req.body?.meta_title,
      meta_description: req.body?.meta_description,
    },
    {
      where: { id: req?.params?.id || id },
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
        cat.name as category_name,
        CASE
          WHEN COUNT(rp.id) > 0 THEN json_agg(rp.*)
          ELSE '[]'::json
        END AS related_products
      FROM
        products prd
      LEFT JOIN categories cat ON cat.id = prd.category_id
      LEFT JOIN products rp ON rp.id = ANY(prd.related_products)
      WHERE prd.slug = '${req?.params?.slug || slug}'
      GROUP BY
        prd.id,
        cat.name;
`;
  return await ProductModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    plain: true,
  });
};

const getByCategory = async (req, slug) => {
  let threshold = "";
  const page = !req?.query?.page
    ? null
    : req?.query?.page < 1
    ? 1
    : req?.query?.page;

  const limit = !req?.query?.limit
    ? null
    : req?.query?.limit
    ? req?.query?.limit
    : 10;

  if (page && limit) {
    const offset = (page - 1) * limit;
    threshold = `LIMIT '${limit}' OFFSET '${offset}'`;
  }

  let query = `
    SELECT
      prd.*,
      cat.name AS category_name,
      cat.slug AS category_slug,
      brd.name AS brand_name,
      brd.slug AS brand_slug
    FROM
      products prd
      LEFT JOIN categories cat ON cat.id = prd.category_id
      LEFT JOIN brands brd ON brd.id = prd.brand_id
      WHERE cat.slug = '${slug}'
      ${threshold}
  `;

  const products = await ProductModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true,
  });

  const { total } = await ProductModel.sequelize.query(
    `SELECT COUNT(id) AS total FROM products;`,
    {
      type: QueryTypes.SELECT,
      plain: true,
    }
  );
  return {
    products,
    total_page: Math.ceil(Number(total) / Number(limit)),
    page: page,
  };
};

const getByBrand = async (req, slug) => {
  let threshold = "";
  const page = !req?.query?.page
    ? null
    : req?.query?.page < 1
    ? 1
    : req?.query?.page;

  const limit = !req?.query?.limit
    ? null
    : req?.query?.limit
    ? req?.query?.limit
    : 10;

  if (page && limit) {
    const offset = (page - 1) * limit;
    threshold = `LIMIT '${limit}' OFFSET '${offset}'`;
  }

  let query = `
    SELECT
      prd.*,
      cat.name AS category_name,
      cat.slug AS category_slug,
      brd.name AS brand_name,
      brd.slug AS brand_slug
    FROM
      products prd
      LEFT JOIN categories cat ON cat.id = prd.category_id
      LEFT JOIN brands brd ON brd.id = prd.brand_id
      WHERE brd.slug = '${slug}'
      ${threshold}
  `;

  const products = await ProductModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true,
  });

  const { total } = await ProductModel.sequelize.query(
    `SELECT COUNT(id) AS total FROM products;`,
    {
      type: QueryTypes.SELECT,
      plain: true,
    }
  );

  return {
    products,
    total_page: Math.ceil(Number(total) / Number(limit)),
    page: page,
  };
};

const deleteById = async (req, id) => {
  return await ProductModel.destroy({
    where: { id: req.params.id || id },
  });
};

const publishProductById = async (id, value) => {
  const [rowCount, rows] = await ProductModel.update(
    { status: value },
    {
      where: { id: id },
      returning: true,
      plain: true,
      raw: true,
    }
  );

  return rows;
};

const countProducts = async (last_30_days = false) => {
  let whereClause = {};
  let resultObj = {};

  if (last_30_days) {
    whereClause = {
      created_at: {
        [Op.gte]: moment().subtract(30, "days").toDate(),
      },
    };
  }

  const conditions = [
    { status: "published" },
    { status: "draft" },
    { status: "pending" },
  ];

  const results = await Promise.all(
    conditions.map(async (condition) => {
      const count = await ProductModel.count({
        where: {
          ...whereClause,
          ...condition,
        },
      });
      return {
        [condition.status]: count.toString(),
      };
    })
  );

  results.map((item) => Object.assign(resultObj, item));
  return resultObj;
};

const searchProducts = async (req) => {
  const q = req.query.q.split("-").join(" ");
  if (!q) return [];

  const query = `
    SELECT 
      p.id, p.title, p.pictures, p.slug, p.tags
    FROM products AS p
    WHERE 
      p.title ILIKE '%${q}%' 
      OR '%${q}%' = ANY(p.tags) 
      OR EXISTS (
        SELECT 1 
        FROM unnest(p.tags) AS tag 
        WHERE tag ILIKE '%${q}%'
      )
  `;

  // Fetch templates and categories based on the search term
  return await ProductModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true,
  });
};

const test = async () => {
  return await ProductModel.findAll();
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
  getByCategory: getByCategory,
  getByBrand: getByBrand,
  searchProducts: searchProducts,
  countProducts: countProducts,
  test: test,
};
