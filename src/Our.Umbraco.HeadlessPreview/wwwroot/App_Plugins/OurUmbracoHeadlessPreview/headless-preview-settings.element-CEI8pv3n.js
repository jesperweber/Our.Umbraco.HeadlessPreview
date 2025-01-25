import { LitElement as y, html as n, css as x, state as c, customElement as P } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as $ } from "@umbraco-cms/backoffice/element-api";
import { O as v } from "./services.gen-DnrXTMvY.js";
import { UMB_NOTIFICATION_CONTEXT as U } from "@umbraco-cms/backoffice/notification";
var k = Object.defineProperty, I = Object.getOwnPropertyDescriptor, w = (e) => {
  throw TypeError(e);
}, g = (e, t, i, a) => {
  for (var o = a > 1 ? void 0 : a ? I(t, i) : t, l = e.length - 1, d; l >= 0; l--)
    (d = e[l]) && (o = (a ? d(t, i, o) : d(o)) || o);
  return a && o && k(t, i, o), o;
}, _ = (e, t, i) => t.has(e) || w("Cannot " + i), h = (e, t, i) => (_(e, t, "read from private field"), t.get(e)), b = (e, t, i) => t.has(e) ? w("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), T = (e, t, i, a) => (_(e, t, "write to private field"), t.set(e, i), i), u, p;
let r = class extends $(y) {
  constructor() {
    super(), b(this, u), this._toggledInfos = [], this._loadingConfiguration = !0, b(this, p, (e) => {
      this._toggledInfos.includes(e) ? this._toggledInfos.splice(this._toggledInfos.indexOf(e), 1) : this._toggledInfos.push(e), this.requestUpdate();
    }), this.consumeContext(U, (e) => {
      T(this, u, e);
    }), this._getConfiguration();
  }
  async _getConfiguration() {
    var i;
    const { data: e, error: t } = await v.getConfiguration();
    if (this._loadingConfiguration = !1, t) {
      (i = h(this, u)) == null || i.peek("danger", { data: { message: "Error loading configuration" } });
      return;
    }
    this._headlessPreviewConfiguration = e == null ? void 0 : e.data;
  }
  async _saveConfiguration(e) {
    var a, o;
    const t = e.target;
    t.state = "waiting";
    const { error: i } = await v.saveConfiguration({
      body: this._headlessPreviewConfiguration
    });
    if (i) {
      t.state = "failed", (a = h(this, u)) == null || a.peek("danger", { data: { message: "Error saving configuration" } });
      return;
    }
    t.state = "success", (o = h(this, u)) == null || o.peek("positive", { data: { message: "Configuration saved" } });
  }
  render() {
    var e, t, i, a, o, l, d, f, m;
    return n`
        ${this._loadingConfiguration ? n`<div class="loader-container "><uui-loader /></div>` : n`
          <div>
            <uui-scroll-container>

              ${(e = this._headlessPreviewConfiguration) != null && e.configuredFromSettingsFileOrCode ? n`
                  <uui-box class="notice">
                    <p><strong>The settings are loaded from the appsettings.json file or from code.</strong>&nbsp;<span>Because of that the settings can't be configured from the UI.</span></p>
                  </uui-box>
                ` : ""}

              <uui-box headline="Template URL">
                <p>The template URL defines which URL is opened when you click the preview button.<br />
                    The URL can be a dynamic URL by using placeholders.</p>
                <div class="more-info-container">
                    <div class="info ${this._toggledInfos.includes("templateUrl") ? "active" : ""}">
                        Placeholders
                        <ul>
                            <li><span>{hostname}</span> - The hostname added on the node itself or it's nearest ancestor node with the right culture in Umbraco. If multiple hostnames have same culture it takes the first hostname.</li>
                            <li><span>{slug}</span> - The relative path of the page being previewed.</li>
                        </ul>
                        Template URL Examples
                        <ul>
                            <li>https://mysite.com/api/preview?slug={slug}&secret=mySecret</li>
                            <li>{hostname}/api/preview?slug={slug}&secret=mySecret</li>
                            <li>https://mysite.com/{slug}?preview=true</li>
                        </ul>
                    </div>

                    <a role="button" @click=${() => h(this, p).call(this, "templateUrl")} class="more-info-link">
                      ${this._toggledInfos.includes("templateUrl") ? "Less info" : "More info"}
                    </a>
                </div>
                <uui-label for="template-url">Template URL</uui-label><br />
                <uui-input 
                  value=${((t = this._headlessPreviewConfiguration) == null ? void 0 : t.templateUrl) ?? ""} 
                  @change=${(s) => {
      this._headlessPreviewConfiguration && (this._headlessPreviewConfiguration.templateUrl = s.target.value);
    }} 
                  id="template-url" 
                  label="Template URL"
                  ?readonly=${((i = this._headlessPreviewConfiguration) == null ? void 0 : i.configuredFromSettingsFileOrCode) ?? !1}>
                </uui-input>
              </uui-box>

              <uui-box headline="Preview Mode Settings">
                <p>Preview mode defines how the preview is working based on the content type and/or node id.<br />
                    The preview mode is evaluated in the order they are registered and returns the mode for the first matching setting.</p>
                <div class="more-info-container">
                    <div class="info ${this._toggledInfos.includes("previewMode") ? "active" : ""}">
                        Potential modes
                        <ul>
                            <li>UseHeadlessPreview - Uses the headless preview functionality. The default setting</li>
                            <li>UseStandardPreview - Uses the default Umbraco preview functionality</li>
                            <li>DisablePreview - Removes the preview button</li>
                        </ul>
                    </div>

                    <a role="button" @click=${() => h(this, p).call(this, "previewMode")} class="more-info-link">
                      ${this._toggledInfos.includes("previewMode") ? "Less info" : "More info"}
                    </a>
                </div>

                ${((a = this._headlessPreviewConfiguration) == null ? void 0 : a.previewModeSettings.length) === 0 ? n`
                      <uui-box class="preview-mode-settings">
                          <i>No custom preview mode configured - this can be configured in appsettings.json or by code. See <a href="https://github.com/jesperweber/Our.Umbraco.HeadlessPreview?tab=readme-ov-file#appsettingsjson" target="_blank">documentation</a></i>
                      </uui-box>
                    ` : n`
                      ${(o = this._headlessPreviewConfiguration) == null ? void 0 : o.previewModeSettings.map(
      (s, C) => n`
                          <uui-box class="preview-mode-settings">
                            <span><strong>Order:</strong> ${C + 1}<br /></span>
                            <span><strong>Type:</strong> ${s.type}<br /></span>
                            <span><strong>Mode:</strong> ${s.mode}<br /></span>
                            ${s.type == "ContentType" ? n`<span><strong>Content Types:</strong> ${s.contentTypes.join(", ")}<br /></span>` : ""}
                            ${s.type == "NodeId" ? n`<span><strong>Node Ids:</strong> ${s.nodeIds.join(", ")}<br /></span>` : ""}
                            ${s.type == "NodeId" ? n`<span><strong>Include Descendants:</strong> ${s.includeDescendants}</span>` : ""}
                          </uui-box>
                        `
    )}
                  `}

              </uui-box>

              <uui-box headline="Disable">
                <p>Disables the headless preview and uses standard Umbraco</p>
                <uui-checkbox 
                  .checked=${((l = this._headlessPreviewConfiguration) == null ? void 0 : l.disabled) ?? !1} 
                  @change=${(s) => {
      this._headlessPreviewConfiguration && (this._headlessPreviewConfiguration.disabled = s.target.checked);
    }} 
                  label="Check to disable headless preview" 
                  label-position="right"
                  ?readonly=${((d = this._headlessPreviewConfiguration) == null ? void 0 : d.configuredFromSettingsFileOrCode) ?? !1}>
                    Check to disable headless preview
                </uui-checkbox>
              </uui-box>
            </uui-scroll-container>

            ${(f = this._headlessPreviewConfiguration) != null && f.configuredFromSettingsFileOrCode ? "" : n`
                  <div id="editor-bottom">
                    <uui-button
                          look="primary"
                          color="positive"
                          label="Save configuration"
                          ?disabled=${((m = this._headlessPreviewConfiguration) == null ? void 0 : m.configuredFromSettingsFileOrCode) ?? !1}
                          @click=${(s) => this._saveConfiguration(s)}>
                          Save configuration
                      </uui-button>
                  </div>`}
          </div>
        `}
    `;
  }
};
u = /* @__PURE__ */ new WeakMap();
p = /* @__PURE__ */ new WeakMap();
r.styles = [
  x`
      :host {
        display: block;
        height: 50%;
        padding: var(--uui-size-layout-1);
      }

      uui-box {
          margin-bottom: var(--uui-size-layout-1);
      }

      uui-input {
        width: 750px;
      }

      h2 {
        margin-top:0;
      }

      .wide {
        grid-column: span 3;
      }

      .info {
        transition: transform 250ms ease-in-out, opacity 250ms ease-in-out, max-height 150ms ease-in-out;
        transform: translateY(-5px);
        opacity: 0;
        max-height: 0px;
        overflow: hidden;
      }

      .info.active {
        transform: translateY(0px);
        opacity: 1;
        max-height: 2000px;
      }

      .notice {
        width: 100%;
        margin-left: 0px;
        margin-bottom: 30px;
        background-color: #1b264f;
      }

      .notice p {
        margin: 15px 0px;
        color: #fff;
        margin: 0px;
      }

      .more-info-link {
        cursor: pointer;
        display: block;
        border: none;
        background-color: unset;
        padding:0;
        margin-top:5px;
        margin-bottom:15px;
        text-decoration: underline;
      }

      #editor-bottom {
        padding-bottom: 20px;
      }

      .loader-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
      }
  `
];
g([
  c()
], r.prototype, "_toggledInfos", 2);
g([
  c()
], r.prototype, "_headlessPreviewConfiguration", 2);
g([
  c()
], r.prototype, "_loadingConfiguration", 2);
r = g([
  P("headless-preview-settings-dashboard")
], r);
const L = r;
export {
  r as HeadlessPreviewSettingsDashboardElement,
  L as default
};
//# sourceMappingURL=headless-preview-settings.element-CEI8pv3n.js.map
