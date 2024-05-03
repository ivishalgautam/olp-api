"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";

const { BAD_REQUEST, INTERNAL_SERVER_ERROR } = constants.http.status;

const get = async (req, res) => {
  try {
    const { total_products } = await table.ProductModel.countProducts();
    // const total_categories = await table.CategoryModel.countCategories();
    // const { total_enquiries } = await table.EnquiryModel.countEnquiries();
    // const { total_orders } = await table.OrderModel.countOrders();

    console.log({ total_products });

    res.send({ status: true, data: { total_products } });
  } catch (error) {
    res
      .code(INTERNAL_SERVER_ERROR)
      .send({ status: false, message: error.message, error });
  }
};

export default {
  get: get,
};
