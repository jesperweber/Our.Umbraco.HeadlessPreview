var g = (s) => {
  throw TypeError(s);
};
var T = (s, n, e) => n.has(s) || g("Cannot " + e);
var f = (s, n, e) => n.has(s) ? g("Cannot add the same private member more than once") : n instanceof WeakSet ? n.add(s) : n.set(s, e);
var a = (s, n, e) => (T(s, n, "access private method"), e);
import { LitElement as I, html as r, nothing as u, css as x } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as C } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT as U } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT as b } from "@umbraco-cms/backoffice/notification";
const m = "/umbraco/management/api/v1/headless-preview";
var i, h, v, w, p, _, y, $;
const c = class c extends C(I) {
  constructor() {
    super(...arguments);
    f(this, i);
    this._loading = !0, this._saving = !1, this._showTemplateInfo = !1, this._showModeInfo = !1;
  }
  connectedCallback() {
    super.connectedCallback(), a(this, i, v).call(this);
  }
  render() {
    if (this._loading || !this._config)
      return r`<uui-box><uui-loader></uui-loader></uui-box>`;
    const e = this._config.configuredFromSettingsFileOrCode, t = this._saving;
    return r`
      <uui-box headline="Headless Preview Settings">
        ${e ? r`<div class="notice">
              <strong>The settings are loaded from appsettings.json or from code.</strong>
              Because of that the settings can't be configured from the UI.
            </div>` : u}

        <h4>Template URL</h4>
        <p>
          The template URL defines which URL is opened when you use the headless
          preview option. It can be dynamic by using placeholders.
        </p>
        <uui-button
          look="default"
          compact
          label=${this._showTemplateInfo ? "Less info" : "More info"}
          @click=${() => this._showTemplateInfo = !this._showTemplateInfo}
          style="text-decoration: underline;"
        ></uui-button>
        ${this._showTemplateInfo ? r`<div class="info">
              <strong>Placeholders</strong>
              <ul>
                <li><code>{hostname}</code> - the assigned domain on the nearest ancestor (or self) matching the culture.</li>
                <li><code>{slug}</code> - the relative path of the page being previewed.</li>
              </ul>
              <strong>Examples</strong>
              <ul>
                <li>https://mysite.com/api/preview?slug={slug}&amp;secret=mySecret</li>
                <li>{hostname}/api/preview?slug={slug}&amp;secret=mySecret</li>
                <li>https://mysite.com/{slug}?preview=true</li>
              </ul>
            </div>` : u}
          <br />
        <uui-input
          id="template-url"
          label="Template URL"
          placeholder="https://mysite.com/api/preview?slug={slug}&secret=mySecret"
          .value=${this._config.templateUrl ?? ""}
          ?disabled=${e || t}
          @input=${a(this, i, _)}
        ></uui-input>

        <h4>Preview Mode Settings</h4>
        <p>
          Preview mode defines how the preview is working based on the content type and/or node guid.<br />
          The preview mode is evaluated in the order they are registered and returns the first matching setting.
        </p>
        <uui-button
          look="default"
          compact
          label=${this._showModeInfo ? "Less info" : "More info"}
          @click=${() => this._showModeInfo = !this._showModeInfo}
          style="text-decoration: underline;"
        ></uui-button>
        ${this._showModeInfo ? r`<div class="info">
              <ul>
                <li><code>UseHeadlessPreview</code> - uses the headless preview URL (default).</li>
                <li><code>UseStandardPreview</code> - uses the default Umbraco preview.</li>
                <li><code>DisablePreview</code> - no headless preview URL is produced.</li>
              </ul>
            </div>` : u}
        ${a(this, i, $).call(this)}

        <h4>Disable</h4>
        <p>Disables the headless preview entirely and falls back to standard Umbraco preview.</p>
        <uui-toggle
          label="Disable headless preview"
          ?checked=${this._config.disabled}
          ?disabled=${e || t}
          @change=${a(this, i, y)}
        ></uui-toggle>

        ${e ? u : r`<div class="actions">
              <uui-button
                look="primary"
                color="positive"
                label="Save configuration"
                state=${t ? "waiting" : ""}
                ?disabled=${t}
                @click=${a(this, i, w)}
              ></uui-button>
            </div>`}
      </uui-box>
    `;
  }
};
i = new WeakSet(), h = async function(e, t) {
  const o = await this.getContext(U);
  if (!o)
    throw new Error("Could not resolve the backoffice auth context.");
  const l = o.getOpenApiConfiguration(), k = typeof l.token == "function" ? await l.token() : l.token;
  return fetch(`${l.base ?? ""}${e}`, {
    ...t,
    credentials: l.credentials,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${k}`,
      ...(t == null ? void 0 : t.headers) ?? {}
    }
  });
}, v = async function() {
  this._loading = !0;
  try {
    const e = await a(this, i, h).call(this, `${m}/configuration`);
    if (!e.ok)
      throw new Error(`Failed to load configuration (${e.status})`);
    this._config = await e.json();
  } catch (e) {
    await a(this, i, p).call(this, "Could not load the headless preview configuration"), console.error(e);
  } finally {
    this._loading = !1;
  }
}, w = async function() {
  if (this._config) {
    this._saving = !0;
    try {
      const e = await a(this, i, h).call(this, `${m}/configuration`, {
        method: "POST",
        body: JSON.stringify(this._config)
      });
      if (!e.ok) {
        const o = await e.text();
        throw new Error(o || `Save failed (${e.status})`);
      }
      const t = await this.getContext(b);
      t == null || t.peek("positive", {
        data: { headline: "Headless Preview", message: "Configuration saved" }
      });
    } catch (e) {
      await a(this, i, p).call(this, e instanceof Error ? e.message : "Error saving configuration");
    } finally {
      this._saving = !1;
    }
  }
}, p = async function(e) {
  const t = await this.getContext(b);
  t == null || t.peek("danger", {
    data: { headline: "Headless Preview", message: e }
  });
}, _ = function(e) {
  this._config && (this._config = {
    ...this._config,
    templateUrl: e.target.value
  });
}, y = function(e) {
  this._config && (this._config = {
    ...this._config,
    disabled: e.target.checked
  });
}, $ = function() {
  var t;
  const e = ((t = this._config) == null ? void 0 : t.previewModeSettings) ?? [];
  return e.length === 0 ? r`<p class="muted"><em>No custom preview mode configured - this can be configured in appsettings.json or by code.</em></p>` : r`<uui-table>
      <uui-table-head>
        <uui-table-head-cell>#</uui-table-head-cell>
        <uui-table-head-cell>Type</uui-table-head-cell>
        <uui-table-head-cell>Mode</uui-table-head-cell>
        <uui-table-head-cell>Match</uui-table-head-cell>
      </uui-table-head>
      ${e.map(
    (o, l) => r`<uui-table-row>
          <uui-table-cell>${l + 1}</uui-table-cell>
          <uui-table-cell>${o.type}</uui-table-cell>
          <uui-table-cell>${o.mode}</uui-table-cell>
          <uui-table-cell>
            ${o.type === "ContentType" ? (o.contentTypes ?? []).join(", ") : `${(o.nodeIds ?? []).join(", ")}${o.includeDescendants ? " (incl. descendants)" : ""}`}
          </uui-table-cell>
        </uui-table-row>`
  )}
    </uui-table>`;
}, c.properties = {
  _loading: { state: !0 },
  _saving: { state: !0 },
  _showTemplateInfo: { state: !0 },
  _showModeInfo: { state: !0 },
  _config: { state: !0 }
}, c.styles = x`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }
    h4 {
      margin-bottom: var(--uui-size-space-2);
    }
    uui-input {
      width: 100%;
      max-width: 640px;
    }
    .notice {
      background: var(--uui-color-warning);
      color: var(--uui-color-warning-contrast);
      padding: var(--uui-size-space-4);
      border-radius: var(--uui-border-radius);
      margin-bottom: var(--uui-size-space-5);
    }
    .info {
      background: var(--uui-color-surface-alt);
      padding: var(--uui-size-space-3);
      border-radius: var(--uui-border-radius);
      margin: var(--uui-size-space-2) 0;
    }
    .muted {
      color: var(--uui-color-text-alt);
    }
    .actions {
      margin-top: var(--uui-size-space-5);
    }
  `;
let d = c;
customElements.define(
  "headless-preview-dashboard",
  d
);
export {
  d as default
};
//# sourceMappingURL=dashboard.js.map
