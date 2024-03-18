"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";
import { generateOrderId } from "../../helpers/generateOrderId.js";

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = constants.http.status;

const create = async (req, res) => {
  try {
    const orderId = generateOrderId();
    const order = await table.OrderModel.create({
      order_id: orderId,
      user_id: req.body.user_id ?? req.user_data.id,
      order_type: req.user_data.role === "admin" ? "order" : "enquiry",
    });

    if (order) {
      req.body?.items.forEach(
        async ({ _id: tempCartProductId, product_id, quantity }) => {
          const newOrder = await table.OrderItemModel.create({
            order_id: order.id,
            product_id,
            quantity,
          });

          if (newOrder) {
            await table.TempCartModel.deleteById(req, tempCartProductId);
          }
        }
      );
    }

    res.send({ message: "Enquiry sent." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const updateById = async (req, res) => {
  try {
    const record = await table.OrderModel.getById(req, req.params.id);

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "order not found!" });
    }

    const data = await table.OrderModel.update(req, req.params.id);

    if (data) {
      req.body.items.forEach(
        async ({ _id: id, quantity, dispatched_quantity, comment, status }) => {
          console.log({ dispatched_quantity });
          await table.OrderItemModel.update({
            id,
            quantity,
            dispatched_quantity: dispatched_quantity ?? 0,
            comment,
            status,
          });
        }
      );
    }

    res.send({ message: "updated" });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.OrderModel.getById(req, req.params.id);

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "order not found!" });
    }

    res.send(record);
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const getByOrderId = async (req, res) => {
  try {
    const record = await table.OrderModel.getByOrderId(req.params.order_id);

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "order not found!" });
    }

    res.send({ data: record });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const get = async (req, res) => {
  try {
    const products = await table.OrderModel.get("order");
    res.send({ data: products });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const getOrderItems = async (req, res) => {
  console.log(req.user_data.id);
  try {
    const orders = await table.OrderItemModel.get(req);
    res.send({ data: orders });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.OrderModel.getById(req, req.params.id);

    if (!record)
      return res.code(NOT_FOUND).send({ message: "order not found!" });

    await table.OrderModel.deleteById(req, req.params.id);
    res.send({ message: "order deleted." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const deleteOrderItemById = async (req, res) => {
  try {
    const record = await table.OrderItemModel.getById(
      req,
      req.params.order_item_id
    );

    if (!record)
      return res.code(NOT_FOUND).send({ message: "order item not found!" });

    await table.OrderItemModel.deleteById(req, req.params.order_item_id);
    res.send({ message: "order item deleted.", data: record });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

export default {
  create: create,
  get: get,
  getByOrderId: getByOrderId,
  updateById: updateById,
  deleteById: deleteById,
  getById: getById,
  deleteOrderItemById: deleteOrderItemById,
  getOrderItems: getOrderItems,
};
