"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";
import slugify from "slugify";

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = constants.http.status;

const create = async (req, res) => {
  try {
    let slug = slugify(req.body.title, { lower: true });
    req.body.slug = slug;
    const record = await table.ProductModel.getBySlug(req, slug);

    if (record)
      return res
        .code(BAD_REQUEST)
        .send({ message: "Product exist with this name!" });

    const product = await table.ProductModel.create(req);

    res.send({ data: product });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const updateById = async (req, res) => {
  console.log({ variants: req.body.variants });
  try {
    let slug = slugify(req.body.title, { lower: true });
    req.body.slug = slug;

    const record = await table.ProductModel.getById(req, req.params.id);

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "Product not found!" });
    }

    const slugExist = await table.ProductModel.getBySlug(req, req.body.slug);

    // Check if there's another product with the same slug but a different ID
    if (slugExist && record?.id !== slugExist?.id)
      return res
        .code(BAD_REQUEST)
        .send({ message: "Product exist with this title!" });

    await table.ProductModel.updateById(req, req.params.id);

    res.send({ message: "Product updated." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const getBySlug = async (req, res) => {
  try {
    const record = await table.ProductModel.getBySlug(req, req.params.slug);

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "Product not found!" });
    }

    res.send({ data: record });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const getByCategory = async (req, res) => {
  try {
    const record = await table.CategoryModel.getBySlug(req, req.params.slug);

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "Category not found!" });
    }

    const { products, total_page, page } =
      await table.ProductModel.getByCategory(req, req.params.slug);

    res.send({ page, total_page, data: products });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const getByBrand = async (req, res) => {
  try {
    const record = await table.BrandModel.getBySlug(req, req.params.slug);

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "Brand not found!" });
    }

    const { products, total_page, page } = await table.ProductModel.getByBrand(
      req,
      req.params.slug
    );

    res.send({ page, total_page, data: products });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.ProductModel.getById(req, req.params.id);

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "Product not found!" });
    }

    const data = {
      ...record,
      variants:
        record.variants?.filter(
          (so) => !Object.values(so).every((d) => d === null)
        ) ?? [],
    };
    res.send({ data: data });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const get = async (req, res) => {
  try {
    const { data, page, total_page } = await table.ProductModel.get(req);
    res.send({ data, page, total_page });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.ProductModel.getById(req, req.params.id);

    if (!record)
      return res.code(NOT_FOUND).send({ message: "Product not found!" });

    await table.ProductModel.deleteById(req, req.params.id);
    res.send({ message: "Product deleted." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const publishProductById = async (req, res) => {
  try {
    const record = await table.ProductModel.getById(req, req.params.id);

    if (!record)
      return res.code(NOT_FOUND).send({ message: "Product not found!" });

    const data = await table.ProductModel.publishProductById(
      req.params.id,
      req.body.is_published
    );

    res.send({
      message: data?.is_published
        ? "Product published."
        : "Product unpublished.",
    });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const searchProducts = async (req, res) => {
  try {
    const data = await table.ProductModel.searchProducts(req);
    res.send(data);
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

export default {
  create: create,
  get: get,
  updateById: updateById,
  deleteById: deleteById,
  getBySlug: getBySlug,
  getById: getById,
  getByCategory: getByCategory,
  getByBrand: getByBrand,
  publishProductById: publishProductById,
  searchProducts: searchProducts,
};
