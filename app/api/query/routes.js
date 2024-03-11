"use strict";
import controller from "./controller.js";

export const querySchema = {
  body: {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string" },
      address: { type: "string" },
      phone: { type: "string" },
      subject: { type: "string" },
      message: { type: "string" },
    },
    required: ["name", "email", "address", "phone", "subject", "message"],
  },
};

export default async function routes(fastify, options) {
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/:id", {}, controller.getById);
  fastify.get("/", {}, controller.get);
}
