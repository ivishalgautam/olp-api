const create = {
  body: {
    type: "object",
    required: ["name", "email", "phone", "industry"],
    properties: {
      name: { type: "string", minLength: 3 },
      email: { type: "string", minLength: 3 },
      phone: { type: "string", minLength: 3 },
      industry: { type: "string", minLength: 3 },
    },
  },
};

export default { create: create };
