import jwtVerify from "../../helpers/auth.js";
import userRoutes from "../../api/users/routes.js";
import productRoutes from "../../api/products/routes.js";
import categoryRoutes from "../../api/categories/routes.js";
import bannerRoutes from "../../api/banner/routes.js";
import brandRoutes from "../../api/brand/routes.js";

export default async function routes(fastify, options) {
  fastify.addHook("onRequest", jwtVerify.verifyToken);
  fastify.register(userRoutes, { prefix: "users" });
  fastify.register(productRoutes, { prefix: "products" });
  fastify.register(categoryRoutes, { prefix: "categories" });
  fastify.register(bannerRoutes, { prefix: "banners" });
  fastify.register(brandRoutes, { prefix: "brands" });
}
