"use strict";
import controller from "./controller.js";
import userController from "../users/controller.js";
import otpController from "../otp/controller.js";

const bodyJsonSchema = {
  type: "object",
  required: [
    "username",
    "password",
    "first_name",
    "email",
    "mobile_number",
    "country_code",
  ],
  properties: {
    username: { type: "string", minLength: 3 },
    password: { type: "string", minLength: 3 },
    first_name: { type: "string", minLength: 3 },
    email: { type: "string", minLength: 3 },
    mobile_number: { type: "string", minLength: 3 },
    country_code: { type: "string", minLength: 3 },
  },
};

const schema = {
  body: bodyJsonSchema,
};

export default async function routes(fastify, options) {
  fastify.post("/login", {}, controller.verifyUserCredentials);
  fastify.post("/signup", { schema }, controller.createNewUser);
  fastify.post("/refresh", {}, controller.verifyRefreshToken);
  fastify.post("/username", {}, userController.checkUsername);
  fastify.post("/:token", {}, userController.resetPassword);
  fastify.post("/otp/send", {}, otpController.create);
  fastify.post("/otp/verify", {}, otpController.verify);
}
