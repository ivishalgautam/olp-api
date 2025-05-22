"use strict";
import userModel from "./models/user.model.js";
import productModel from "./models/product.model.js";
import categoryModel from "./models/category.model.js";
import brandModel from "./models/brand.model.js";
import orderModel from "./models/order.model.js";
import orderItemModel from "./models/order-item.model.js";
import enquiryModel from "./models/enquiry.model.js";
import enquiryItemModel from "./models/enquiry-item.model.js";
import tempCartModel from "./models/temp-cart.model.js";
import queryModel from "./models/query.model.js";
import otpModel from "./models/otp.model.js";
import blogModel from "./models/blog.model.js";
import registrationModel from "./models/registration.model.js";

export default {
  UserModel: userModel,
  ProductModel: productModel,
  CategoryModel: categoryModel,
  BrandModel: brandModel,
  OrderModel: orderModel,
  OrderItemModel: orderItemModel,
  EnquiryModel: enquiryModel,
  EnquiryItemModel: enquiryItemModel,
  TempCartModel: tempCartModel,
  QueryModel: queryModel,
  OtpModel: otpModel,
  BlogModel: blogModel,
  RegistrationModel: registrationModel,
};
