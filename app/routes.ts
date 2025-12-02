import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("photo/:id", "routes/photo.$id.tsx"),
] satisfies RouteConfig;
