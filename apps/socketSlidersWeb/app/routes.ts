import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("generators", "routes/generator.tsx"),
  route("catalog", "routes/catalog.tsx"),
] satisfies RouteConfig;
