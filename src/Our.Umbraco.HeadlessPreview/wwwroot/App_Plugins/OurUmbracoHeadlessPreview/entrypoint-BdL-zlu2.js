import { UMB_AUTH_CONTEXT as a } from "@umbraco-cms/backoffice/auth";
import { c as o } from "./services.gen-DnrXTMvY.js";
const _ = (e, s) => {
  e.consumeContext(a, async (i) => {
    const t = i.getOpenApiConfiguration();
    o.setConfig({
      baseUrl: t.base,
      credentials: t.credentials
    }), o.interceptors.request.use(async (n, c) => {
      const r = await t.token();
      return n.headers.set("Authorization", `Bearer ${r}`), n;
    });
  });
}, f = (e, s) => {
};
export {
  _ as onInit,
  f as onUnload
};
//# sourceMappingURL=entrypoint-BdL-zlu2.js.map
