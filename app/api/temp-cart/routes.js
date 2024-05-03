"use strict";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post("/temp-cart", {}, controller.create);
  fastify.get("/temp-cart", {}, controller.get);
  fastify.delete("/temp-cart/:id", {}, controller.deleteById);
}
