var m = (e) => {
  throw TypeError(e);
};
var p = (e, i, t) => i.has(e) || m("Cannot " + t);
var u = (e, i, t) => (p(e, i, "read from private field"), t ? t.call(e) : i.get(e)), c = (e, i, t) => i.has(e) ? m("Cannot add the same private member more than once") : i instanceof WeakSet ? i.add(e) : i.set(e, t), h = (e, i, t, s) => (p(e, i, "write to private field"), s ? s.call(e, t) : i.set(e, t), t), l = (e, i, t) => (p(e, i, "access private method"), t);
import { UmbConditionBase as A } from "@umbraco-cms/backoffice/extension-registry";
import { UMB_AUTH_CONTEXT as v } from "@umbraco-cms/backoffice/auth";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as _ } from "@umbraco-cms/backoffice/document";
const E = "Our.Umbraco.HeadlessPreview.Condition.Applies";
var n, r, f;
class w extends A {
  constructor(t, s) {
    super(t, s);
    c(this, r);
    c(this, n);
    this.permitted = !1, this.consumeContext(_, (o) => {
      o && this.observe(o.unique, (a) => {
        h(this, n, a ?? void 0), l(this, r, f).call(this);
      });
    });
  }
}
n = new WeakMap(), r = new WeakSet(), f = async function() {
  const t = u(this, n);
  if (!t) {
    this.permitted = !1;
    return;
  }
  try {
    const s = await this.getContext(v);
    if (!s) {
      this.permitted = !1;
      return;
    }
    const o = s.getOpenApiConfiguration(), a = typeof o.token == "function" ? await o.token() : o.token, d = await fetch(
      `${o.base ?? ""}/umbraco/management/api/v1/headless-preview/preview-mode?key=${encodeURIComponent(t)}`,
      {
        credentials: o.credentials,
        headers: { Authorization: `Bearer ${a}` }
      }
    );
    if (!d.ok) {
      this.permitted = !1;
      return;
    }
    const C = await d.json();
    this.permitted = C.applies === !0;
  } catch {
    this.permitted = !1;
  }
};
const U = (e, i) => {
  const t = {
    type: "condition",
    name: "Headless Preview Applies Condition",
    alias: E,
    api: w
  };
  i.register(t);
};
export {
  U as onInit
};
//# sourceMappingURL=entrypoint.js.map
