"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = constants.http.status;

const create = async (req, res) => {
  try {
    if (!req?.user_data?.id)
      return res
        .code(401)
        .send({ status: false, message: "Please login first!" });

    const record = await table.TempCartModel.getByUserAndProductId({
      user_id: req.user_data.id,
      product_id: req.body.product_id,
    });

    if (record)
      return res
        .code(BAD_REQUEST)
        .send({ message: "Product exist in the cart!" });

    await table.TempCartModel.create({
      user_id: req.user_data.id,
      product_id: req.body.product_id,
    });

    res.send({ status: true, message: "Added to cart." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const get = async (req, res) => {
  try {
    const data = await table.TempCartModel.get(req);
    res.send({ status: true, data: data });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.TempCartModel.getById(req);
    await table.TempCartModel.deleteById(req);
    // console.log({ record });
    res.send({ status: true, message: "Item removed", data: record });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

export default {
  create: create,
  get: get,
  deleteById: deleteById,
};
