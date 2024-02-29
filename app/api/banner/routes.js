"use strict";
import controller from "./controller.js";

const schema = {
  type: "object",
  properties: {
    type: { type: "string" },
    name: { type: "string" },
    image: { type: "object" },
  },
  required: ["type", "name", "image"],
};

export default async function routes(fastify, options) {
  fastify.post(
    "/",
    {
      schema: {
        body: schema,
      },
    },
    controller.create
  );
  fastify.get("/", {}, controller.get);
  fastify.put("/:id", {}, controller.updateById);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/:id", {}, controller.getById);
}
