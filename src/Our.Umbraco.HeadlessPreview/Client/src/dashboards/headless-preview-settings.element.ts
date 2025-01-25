import { LitElement, css, html, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { OurUmbracoHeadlessPreviewService, PreviewConfiguration, PreviewModeSettingContentType, PreviewModeSettingNodeId } from "../api";
import { UMB_NOTIFICATION_CONTEXT, UmbNotificationContext } from "@umbraco-cms/backoffice/notification";
import { UUIButtonElement } from "@umbraco-cms/backoffice/external/uui";

@customElement('headless-preview-settings-dashboard')
export class HeadlessPreviewSettingsDashboardElement extends UmbElementMixin(LitElement) {

  constructor() {
    super();

    this.consumeContext(UMB_NOTIFICATION_CONTEXT, (notificationContext) => {
      this.#notificationContext = notificationContext;
    });

    this._getConfiguration();
  }

  #notificationContext: UmbNotificationContext | undefined = undefined;

  @state()
  private _toggledInfos: string[] = []

  @state()
  private _headlessPreviewConfiguration: PreviewConfiguration | undefined;

  @state()
  private _loadingConfiguration = true;
  
  private async _getConfiguration() {
    const { data, error } = await OurUmbracoHeadlessPreviewService.getConfiguration();

    this._loadingConfiguration = false;

    if (error) {
      this.#notificationContext?.peek('danger', { data: { message: 'Error loading configuration' } });
      return;
    }

    this._headlessPreviewConfiguration = data?.data;
  }
  
  private async _saveConfiguration(ev: Event) {
      const buttonElement = ev.target as UUIButtonElement;
      buttonElement.state = "waiting";

    const { error } = await OurUmbracoHeadlessPreviewService.saveConfiguration({
      body: this._headlessPreviewConfiguration
    });

    if (error) {
      buttonElement.state = "failed";
      this.#notificationContext?.peek('danger', { data: { message: 'Error saving configuration' } });
      return;
    }

    buttonElement.state = "success";
    this.#notificationContext?.peek('positive', { data: { message: 'Configuration saved' } });
  }

  #toggleInfo = (info: string) => {
    if(!this._toggledInfos.includes(info)) {
      this._toggledInfos.push(info);
    } else {
      this._toggledInfos.splice(this._toggledInfos.indexOf(info), 1);
    }
    this.requestUpdate();
  };

  render() {
    return html`
        ${this._loadingConfiguration 
        ? html`<div class="loader-container "><uui-loader /></div>` 
        : html`
          <div>
            <uui-scroll-container>

              ${this._headlessPreviewConfiguration?.configuredFromSettingsFileOrCode 
                ? html`
                  <uui-box class="notice">
                    <p><strong>The settings are loaded from the appsettings.json file or from code.</strong>&nbsp;<span>Because of that the settings can't be configured from the UI.</span></p>
                  </uui-box>
                ` 
                : ``
              }

              <uui-box headline="Template URL">
                <p>The template URL defines which URL is opened when you click the preview button.<br />
                    The URL can be a dynamic URL by using placeholders.</p>
                <div class="more-info-container">
                    <div class="info ${this._toggledInfos.includes('templateUrl') ? "active": ""}">
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

                    <a role="button" @click=${() => this.#toggleInfo('templateUrl')} class="more-info-link">
                      ${this._toggledInfos.includes('templateUrl') ? "Less info": "More info"}
                    </a>
                </div>
                <uui-label for="template-url">Template URL</uui-label><br />
                <uui-input 
                  value=${this._headlessPreviewConfiguration?.templateUrl ?? ""} 
                  @change=${(e: InputEvent) => { if(this._headlessPreviewConfiguration) {this._headlessPreviewConfiguration.templateUrl = (e.target as HTMLInputElement).value}}} 
                  id="template-url" 
                  label="Template URL"
                  ?readonly=${this._headlessPreviewConfiguration?.configuredFromSettingsFileOrCode ?? false}>
                </uui-input>
              </uui-box>

              <uui-box headline="Preview Mode Settings">
                <p>Preview mode defines how the preview is working based on the content type and/or node id.<br />
                    The preview mode is evaluated in the order they are registered and returns the mode for the first matching setting.</p>
                <div class="more-info-container">
                    <div class="info ${this._toggledInfos.includes('previewMode') ? "active": ""}">
                        Potential modes
                        <ul>
                            <li>UseHeadlessPreview - Uses the headless preview functionality. The default setting</li>
                            <li>UseStandardPreview - Uses the default Umbraco preview functionality</li>
                            <li>DisablePreview - Removes the preview button</li>
                        </ul>
                    </div>

                    <a role="button" @click=${() => this.#toggleInfo('previewMode')} class="more-info-link">
                      ${this._toggledInfos.includes('previewMode') ? "Less info": "More info"}
                    </a>
                </div>

                ${this._headlessPreviewConfiguration?.previewModeSettings.length === 0 
                  ? html`
                      <uui-box class="preview-mode-settings">
                          <i>No custom preview mode configured - this can be configured in appsettings.json or by code. See <a href="https://github.com/jesperweber/Our.Umbraco.HeadlessPreview?tab=readme-ov-file#appsettingsjson" target="_blank">documentation</a></i>
                      </uui-box>
                    ` 
                  : html`
                      ${this._headlessPreviewConfiguration?.previewModeSettings.map((previewModeSetting, index) =>
                        html`
                          <uui-box class="preview-mode-settings">
                            <span><strong>Order:</strong> ${index+1}<br /></span>
                            <span><strong>Type:</strong> ${previewModeSetting.type}<br /></span>
                            <span><strong>Mode:</strong> ${previewModeSetting.mode}<br /></span>
                            ${previewModeSetting.type == 'ContentType' ? html`<span><strong>Content Types:</strong> ${(previewModeSetting as PreviewModeSettingContentType).contentTypes.join(", ")}<br /></span>` : ''}
                            ${previewModeSetting.type == 'NodeId' ? html`<span><strong>Node Ids:</strong> ${(previewModeSetting as PreviewModeSettingNodeId).nodeIds.join(", ")}<br /></span>` : ''}
                            ${previewModeSetting.type == 'NodeId' ? html`<span><strong>Include Descendants:</strong> ${(previewModeSetting as PreviewModeSettingNodeId).includeDescendants}</span>` : ''}
                          </uui-box>
                        `
                      )}
                  `}

              </uui-box>

              <uui-box headline="Disable">
                <p>Disables the headless preview and uses standard Umbraco</p>
                <uui-checkbox 
                  .checked=${this._headlessPreviewConfiguration?.disabled ?? false} 
                  @change=${(e: InputEvent) => { if(this._headlessPreviewConfiguration) {this._headlessPreviewConfiguration.disabled = (e.target as HTMLInputElement).checked}}} 
                  label="Check to disable headless preview" 
                  label-position="right"
                  ?readonly=${this._headlessPreviewConfiguration?.configuredFromSettingsFileOrCode ?? false}>
                    Check to disable headless preview
                </uui-checkbox>
              </uui-box>
            </uui-scroll-container>

            ${!this._headlessPreviewConfiguration?.configuredFromSettingsFileOrCode 
              ? html`
                  <div id="editor-bottom">
                    <uui-button
                          look="primary"
                          color="positive"
                          label="Save configuration"
                          ?disabled=${this._headlessPreviewConfiguration?.configuredFromSettingsFileOrCode ?? false}
                          @click=${(event: Event) => this._saveConfiguration(event)}>
                          Save configuration
                      </uui-button>
                  </div>` 
              : ''
            }
          </div>
        `}
    `;
  }

  static styles = [
    css`
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
  `];
}

export default HeadlessPreviewSettingsDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    'headless-preview-settings-dashboard': HeadlessPreviewSettingsDashboardElement;
  }
}
