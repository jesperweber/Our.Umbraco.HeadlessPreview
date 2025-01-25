var u = (t) => {
  throw TypeError(t);
};
var c = (t, o, e) => o.has(t) || u("Cannot " + e);
var d = (t, o, e) => (c(t, o, "read from private field"), e ? e.call(t) : o.get(t)), p = (t, o, e) => o.has(t) ? u("Cannot add the same private member more than once") : o instanceof WeakSet ? o.add(t) : o.set(t, e), w = (t, o, e, i) => (c(t, o, "write to private field"), i ? i.call(t, e) : o.set(t, e), e);
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as l } from "@umbraco-cms/backoffice/document";
import { UmbWorkspaceActionBase as m, UMB_SUBMITTABLE_WORKSPACE_CONTEXT as C } from "@umbraco-cms/backoffice/workspace";
import { O as h } from "./services.gen-DnrXTMvY.js";
import { UMB_NOTIFICATION_CONTEXT as _ } from "@umbraco-cms/backoffice/notification";
var s;
class M extends m {
  constructor(e, i) {
    super(e, i);
    p(this, s);
    this.disable(), this.consumeContext(C, (r) => {
      w(this, s, r);
    }), this._setup();
  }
  async _setup() {
    const e = await this.getContext(_), i = await this.getContext(l), r = i.getUnique(), n = i.getContentTypeId(), { data: a, error: v } = await h.getPreviewMode({ query: { nodeGuid: r ?? void 0, contentTypeGuid: n } });
    if (v) {
      e.peek("danger", { data: { message: "Error loading configuration" } });
      return;
    }
    this._previewMode = a == null ? void 0 : a.data.previewMode, this._previewMode !== "DisablePreview" && this.enable();
  }
  async execute() {
    var e;
    try {
      const i = await this.getContext(l), r = i.getUnique();
      if (this._previewMode === "UseStandardPreview") {
        await i.saveAndPreview();
        return;
      } else if (this._previewMode === "UseHeadlessPreview") {
        await ((e = d(this, s)) == null ? void 0 : e.requestSubmit()), setTimeout(() => {
          this._openPreview(r ?? "", this._tryGetCulture());
        }, 500);
        return;
      }
    } catch (i) {
      console.error("Failed to save and preview document", i);
    }
  }
  // TODO can we get the culture from the workspace context, instead of relying on the URL?
  _tryGetCulture() {
    const e = window.location.pathname.split("/"), i = /\/([a-zA-Z]{2}-[a-zA-Z]{2})/;
    return e.find((n) => i.test(n)) ?? "";
  }
  _openPreview(e, i) {
    window.open(`/umbraco/backoffice/headlesspreview?guid=${e}&culture=${i}`);
  }
}
s = new WeakMap();
export {
  M as default
};
//# sourceMappingURL=save-and-preview.action-CqlzGS2a.js.map
