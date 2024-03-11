"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = constants.http.status;

const create = async (req, res) => {
  try {
    if (!req?.user_data?.id)
      return res.code(401).send({ message: "Please login first!" });

    const record = await table.TempCartModel.getByUserAndProductId({
      user_id: req.body.user_id ?? req.user_data.id,
      product_id: req.body.product_id,
    });

    if (record)
      return res
        .code(BAD_REQUEST)
        .send({ message: "Product exist in the cart!" });

    await table.TempCartModel.create({
      user_id: req.body.user_id ?? req.user_data.id,
      product_id: req.body.product_id,
    });

    res.send({ message: "added to cart." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const get = async (req, res) => {
  try {
    const products = await table.TempCartModel.get(req);
    res.send({ data: products });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.TempCartModel.getById(req);
    await table.TempCartModel.deleteById(req);
    console.log({ record });
    res.send({ message: "Item removed", data: record });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

export default {
  create: create,
  get: get,
  deleteById: deleteById,
};
