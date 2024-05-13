"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";
import {
  generateEnquiryId,
  generateOrderId,
} from "../../helpers/generateId.js";

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = constants.http.status;

const create = async (req, res) => {
  try {
    const enquiry_id = generateEnquiryId();

    const enquiry = await table.EnquiryModel.create({
      enquiry_id: enquiry_id,
      user_id: req.user_data.id,
    });

    if (enquiry) {
      req.body?.items.forEach(
        async ({ _id: tempCartProductId, product_id, quantity }) => {
          const newOrder = await table.EnquiryItemModel.create({
            enquiry_id: enquiry.id,
            product_id: product_id,
            quantity: quantity,
          });

          if (newOrder) {
            await table.TempCartModel.deleteById(req, tempCartProductId);
          }
        }
      );
    }

    res.send({ status: true, message: "Enquiry sent." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const updateById = async (req, res) => {
  try {
    const record = await table.EnquiryModel.getById(req.params.id);

    if (!record) {
      return res
        .code(NOT_FOUND)
        .send({ status: false, message: "Enquiry not found!" });
    }

    const data = await table.EnquiryModel.update(req, req.params.id);

    if (data) {
      req.body.items.forEach(
        async ({ _id: id, available_quantity, comment, status }) => {
          await table.EnquiryItemModel.update({
            id,
            available_quantity: available_quantity ?? null,
            comment,
            status,
          });
        }
      );
    }

    res.send({ status: true, message: "Updated" });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.EnquiryModel.getById(req.params.id);

    if (!record) {
      return res
        .code(NOT_FOUND)
        .send({ status: false, message: "Enquiry not found!" });
    }

    res.send({ status: true, data: [record] });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const get = async (req, res) => {
  try {
    const data = await table.EnquiryModel.get(req);
    res.send({ status: true, data: data });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.EnquiryModel.deleteById(req, req.params.id);

    if (!record)
      return res
        .code(NOT_FOUND)
        .send({ status: false, message: "Enquiry not found!" });

    res.send({ status: true, message: "Enquiry deleted." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const convertToOrder = async (req, res) => {
  try {
    const record = await table.EnquiryModel.getById(req.params.id);

    if (!record)
      return res
        .code(NOT_FOUND)
        .send({ status: false, message: "Enquiry not found!" });

    const shouldConvertToOrder = record.items
      .map((item) => item.status)
      .some((ele) => ele === "partially_available" || ele === "available");

    if (!shouldConvertToOrder)
      return res
        .code(400)
        .send({ message: "This enquiry cannot coverted be to order." });

    const orderId = generateOrderId();

    const order = await table.OrderModel.create({
      order_id: orderId,
      user_id: record.user_id,
    });

    record.items.forEach(
      async ({ id, product_id, quantity, status, available_quantity }) => {
        if (status === "partially_available" || status === "available") {
          await table.OrderItemModel.create({
            order_id: order.id,
            product_id: product_id,
            quantity:
              status === "partially_available" ? available_quantity : quantity,
            dispatched_quantity: available_quantity,
            status: "pending",
          });
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

const deleteOrderItemById = async (req, res) => {
  try {
    const record = await table.EnquiryItemModel.getById(
      req,
      req.params.order_item_id
    );

    if (!record)
      return res
        .code(NOT_FOUND)
        .send({ status: false, message: "Enquiry item not found!" });

    await table.EnquiryItemModel.deleteById(req, req.params.order_item_id);
    res.send({ status: true, message: "Enquiry item deleted.", data: record });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send({ status: false, error });
  }
};

export default {
  create: create,
  updateById: updateById,
  deleteById: deleteById,
  get: get,
  getById: getById,
  deleteOrderItemById: deleteOrderItemById,
  convertToOrder: convertToOrder,
};
