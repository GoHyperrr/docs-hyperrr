import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("guides", "routes/guides.tsx"),
  route("api", "routes/api-docs.tsx"),
  route("blog", "routes/blog.tsx"),
  route("blog/:id", "routes/blog-detail.tsx"),
] satisfies RouteConfig;
