var C = (i) => {
  throw TypeError(i);
};
var u = (i, e, t) => e.has(i) || C("Cannot " + t);
var p = (i, e, t) => (u(i, e, "read from private field"), t ? t.call(i) : e.get(i)), l = (i, e, t) => e.has(i) ? C("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(i) : e.set(i, t), m = (i, e, t, o) => (u(i, e, "write to private field"), o ? o.call(i, t) : e.set(i, t), t), h = (i, e, t) => (u(i, e, "access private method"), t);
import { UmbConditionBase as _ } from "@umbraco-cms/backoffice/extension-registry";
import { UMB_AUTH_CONTEXT as E } from "@umbraco-cms/backoffice/auth";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as f } from "@umbraco-cms/backoffice/document";
const D = "Our.Umbraco.HeadlessPreview.Condition.Applies", v = "Our.Umbraco.HeadlessPreview.Condition.NotDisabled";
var a, s, r, w, P;
class A extends _ {
  constructor(t, o, n) {
    super(t, o);
    l(this, r);
    l(this, a);
    // Permitted value used before/without a resolved result (fail-open vs fail-closed).
    l(this, s);
    m(this, s, n), this.permitted = n, this.consumeContext(f, (d) => {
      d && this.observe(d.unique, (c) => {
        m(this, a, c ?? void 0), h(this, r, w).call(this);
      });
    });
  }
}
a = new WeakMap(), s = new WeakMap(), r = new WeakSet(), w = async function() {
  const t = p(this, a);
  if (!t) {
    this.permitted = p(this, s);
    return;
  }
  const o = await h(this, r, P).call(this, t);
  this.permitted = o ? this.permit(o) : p(this, s);
}, P = async function(t) {
  try {
    const o = await this.getContext(E);
    if (!o) return null;
    const n = o.getOpenApiConfiguration(), d = typeof n.token == "function" ? await n.token() : n.token, c = await fetch(
      `${n.base ?? ""}/umbraco/management/api/v1/headless-preview/preview-mode?key=${encodeURIComponent(t)}`,
      {
        credentials: n.credentials,
        headers: { Authorization: `Bearer ${d}` }
      }
    );
    return c.ok ? await c.json() : null;
  } catch {
    return null;
  }
};
class b extends A {
  constructor(e, t) {
    super(e, t, !1);
  }
  permit(e) {
    return e.applies === !0;
  }
}
class I extends A {
  constructor(e, t) {
    super(e, t, !0);
  }
  permit(e) {
    return e.mode !== "DisablePreview";
  }
}
const T = (i, e) => {
  const t = {
    type: "condition",
    name: "Headless Preview Applies Condition",
    alias: D,
    api: b
  }, o = {
    type: "condition",
    name: "Headless Preview Not Disabled Condition",
    alias: v,
    api: I
  };
  e.register(t), e.register(o), e.appendCondition("Umb.WorkspaceAction.Document.SaveAndPreview", {
    alias: v
  });
};
export {
  T as onInit
};
//# sourceMappingURL=entrypoint.js.map
