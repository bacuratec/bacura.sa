import { proxy } from "./proxy.js";
export { config } from "./proxy.js";

export async function middleware(request) {
  return proxy(request);
}

