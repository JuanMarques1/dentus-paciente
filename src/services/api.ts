import { createDemoApi } from "./demoApi";
import { createHttpApi } from "./httpApi";
export function createApi() {
  const mode = import.meta.env.VITE_API_MODE ?? "demo";
  if (mode === "demo") return createDemoApi(220);
  if (mode === "http")
    return createHttpApi(import.meta.env.VITE_API_BASE_URL ?? "");
  throw new Error("VITE_API_MODE deve ser demo ou http.");
}
