"use strict";
import controller from "./controller.js";
import userController from "../users/controller.js";

const schema = {
  body: {
    type: "object",
    properties: {
      name: { type: "string" },
      image: { type: "string" },
    },
    required: ["name"],
  },
};

export default async function routes(fastify, options) {
  fastify.post("/login", {}, controller.verifyUserCredentials);
  fastify.post("/signup", {}, controller.createNewUser);
  fastify.post("/refresh", {}, controller.verifyRefreshToken);
  fastify.post("/username", {}, userController.checkUsername);
  fastify.post("/:token", {}, userController.resetPassword);
}
