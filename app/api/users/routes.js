"use strict";

import controller from "./controller.js";
import jwtVerify from "../../helpers/auth.js";

export default async function routes(fastify, options) {
  fastify.addHook("onRequest", jwtVerify.verifyToken);
  fastify.post("/:id/change-password", {}, controller.updatePassword);
  fastify.put("/:id", {}, controller.update);
  fastify.put("/status/:id", {}, controller.updateStatus);
  fastify.get("/me", {}, controller.getUser);
  fastify.get("/", {}, controller.get);
  fastify.get("/:id", {}, controller.getById);
  fastify.delete("/:id", {}, controller.deleteById);
}
