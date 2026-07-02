# Upgrade to Umbraco 17

This document recaps the work done to upgrade **Our.Umbraco.HeadlessPreview** from the
Umbraco 9–13 (AngularJS backoffice) era to **Umbraco 17** (the new Lit / Web Components
backoffice on .NET 10).

> Date: 2026-06-30 · Performed with the official `umbraco-cms-backoffice` skills and Context7 docs.

---

## 1. Why this was a big jump

The package previously multi-targeted `net5.0`–`net8.0` and shipped an **AngularJS**
`App_Plugins` extension that:

- decorated `$rootScope` to DOM-replace the core **Preview** button, and
- exposed a settings dashboard rendered from a static `.html` view.

Umbraco 14+ **removed the AngularJS backoffice entirely** and replaced it with a
TypeScript/Lit Web Components backoffice. As a consequence:

- `Umbraco.Cms.Web.BackOffice` no longer exists — `UmbracoAuthorizedApiController`,
  `UmbracoAuthorizedController`, `[PluginController]`, `JsonCamelCaseFormatter` and
  `MapUmbracoRoute` are gone.
- Backoffice APIs are now **Management API** controllers (`ManagementApiControllerBase`,
  `[VersionedApiBackOfficeRoute]`), authenticated with a bearer token.
- Dashboards and preview customisations are registered through a TypeScript
  **`umbraco-package.json`** manifest, not via C# `IDashboard` + an `.html` view.
- Umbraco 17 targets **.NET 10**.

None of the old AngularJS / BackOffice approach is portable, so the frontend and the
backoffice-facing backend were rebuilt.

## 2. Direction chosen

Two decisions were taken up front:

1. **Idiomatic preview mechanism** — instead of re-creating the fragile DOM button swap, the
   package now uses Umbraco's first-class
   [*additional preview environments*](https://docs.umbraco.com/umbraco-cms/develop-with-umbraco/headless-and-apis/content-delivery-api/additional-preview-environments-support)
   feature: a server-side `IUrlProvider.GetPreviewUrlAsync` paired with a client-side
   `previewOption` workspace-action menu item.
2. **v17-only, single target** — dropped the `net5`–`net8` / Umbraco 9–13 branches in favour
   of a single `net10.0` target with the Umbraco dependencies pinned to `[17.0.0,17.9.9)`.

## 3. How headless preview works now

```
Editor clicks "Save and preview" ▸ "Headless preview"   (client previewOption, weight 110)
        │   meta.urlProviderAlias = "headlessPreview"
        ▼
HeadlessPreviewUrlProvider.GetPreviewUrlAsync(content, culture, segment)   (Alias = "headlessPreview")
        │   reads PreviewConfigurationService (appsettings / code / DB)
        │   evaluates per-content-type / per-node PreviewMode
        │   builds {slug} via IPublishedUrlProvider, {hostname} via IDomainService
        ▼
returns UrlInfo(isExternal: true) → backoffice opens the external headless URL
```

A `weight` above 100 makes the option **replace** the default preview entry, preserving the
original package's "override the preview button" intent.

## 4. Changes by area

### Project / packaging
- `Our.Umbraco.HeadlessPreview.csproj`
  - `TargetFrameworks net5.0;net6.0;net7.0;net8.0` → **`TargetFramework net10.0`**, with
    `ImplicitUsings` + `Nullable` enabled.
  - Removed all `Umbraco.Cms.Web.BackOffice` references. Now references
    **`Umbraco.Cms.Web.Common`** and **`Umbraco.Cms.Api.Management`**, both
    `Version="[17.0.0,17.9.9)"`.
  - Added a `Content/None/Compile Remove="Client\**"` group so the TypeScript sources and
    `node_modules` never enter the C# compilation or the NuGet package.
- `Our.Umbraco.HeadlessPreview.Tests.csproj` — `net7.0` → **`net10.0`**.

### Backend (C#)
- **New** `Routing/HeadlessPreviewUrlProvider.cs` — implements `IUrlProvider`. `GetUrl` /
  `GetOtherUrls` are no-ops; `GetPreviewUrlAsync` builds the headless URL, folding in the
  hostname/slug logic that previously lived in `HeadlessPreviewController` and
  `PublishedContentExtensions`, and honouring the configured preview modes.
- `Controllers/Api/PreviewApiController.cs` — rewritten from
  `UmbracoAuthorizedApiController` to **`ManagementApiControllerBase`** with
  `[VersionedApiBackOfficeRoute("headless-preview")]`. Endpoints:
  `GET/POST …/headless-preview/configuration` (dashboard) and
  `GET …/headless-preview/preview-mode?key=…` (used by the client visibility condition).
- **New** `Services/PreviewModeResolver.cs` (+ interface) and `Extensions/ContentExtensions.cs` —
  the per-content-type / per-node mode resolution extracted from the URL provider so both the
  provider and the `preview-mode` endpoint share one implementation.
- `Composers/PreviewComposer.cs` — removed the `UmbracoPipelineFilter` / `MapUmbracoRoute`
  redirect endpoint; now registers the services and calls
  `builder.AddUrlProvider<HeadlessPreviewUrlProvider>()`.
- **Removed**
  - `Controllers/HeadlessPreviewController.cs` (redirect endpoint — replaced by the provider).
  - `Extensions/PublishedContentExtensions.cs` (`IPublishedContentCache.GetRouteById` no longer
    exists; slug building now uses `IPublishedUrlProvider`).
  - `Dashboard/PreviewDashboard.cs` (C# `IDashboard` — dashboards are manifest-registered now).
  - `Models/Api/ApiResponse.cs`, `Models/Api/Response.cs`, `Models/PreviewModeResponse.cs`
    (the old API response envelopes — the Management API returns plain models / status codes).
- **Kept unchanged** (framework-agnostic): `Services/*`, `Configurators/*`,
  `ConfigurationBuilder/*`, `Extensions/UmbracoBuilderExtensions.cs`, and the remaining
  `Models/*` (`PreviewConfiguration`, `PreviewMode`, `IPreviewModeSetting`,
  `PreviewModeSetting*`, `TemplateUrlPlaceHolder`).

### Frontend (TypeScript / Lit)
- **Removed** the entire AngularJS `App_Plugins/.../js`, `views`, `lang`, `package.manifest`.
- **New** `Client/` project — Vite + TypeScript + `@umbraco-cms/backoffice`:
  - `Client/src/dashboard.element.ts` — a `UmbElementMixin(LitElement)` settings dashboard
    (template URL, disable toggle, read-only preview-mode table). It calls the Management API
    using the bearer token from `UMB_AUTH_CONTEXT.getOpenApiConfiguration()` (raw fetch without
    the token would 401) and reports via `UMB_NOTIFICATION_CONTEXT`.
  - `Client/src/condition.ts` — a `UmbConditionBase` that reads the current document's key from
    `UMB_DOCUMENT_WORKSPACE_CONTEXT`, calls the `preview-mode` endpoint and sets `permitted`
    accordingly, hiding the headless option when it doesn't apply.
  - `Client/src/entrypoint.ts` — a `backofficeEntryPoint` that registers the condition.
  - Builds to `App_Plugins/Our.Umbraco.HeadlessPreview/dashboard.js` and `entrypoint.js`.
- **New** `App_Plugins/Our.Umbraco.HeadlessPreview/umbraco-package.json` registering:
  - a `backofficeEntryPoint` (loads `entrypoint.js`),
  - a `dashboard` extension (Settings section), and
  - a `workspaceActionMenuItem` of kind `previewOption`
    (`forWorkspaceActions: "Umb.WorkspaceAction.Document.SaveAndPreview"`,
    `meta.urlProviderAlias: "headlessPreview"`, `weight: 110`) gated by the custom condition.

## 5. Behavioural differences vs. the 9–13 package

- Headless preview is now an entry on the **Save-and-Preview** split button rather than an
  in-place replacement of the button element. With `weight: 110` it takes over the default
  preview slot.
- The headless option is **hidden** (via a custom extension condition) for nodes whose resolved
  mode is `UseStandardPreview`/`DisablePreview`, or when headless preview is globally disabled or
  unconfigured — so the option never errors with *"No preview URL for document"*. The condition
  asks the server (`GET …/headless-preview/preview-mode?key=…`) whether the option applies.
  `DisablePreview` hides only the headless option; the built-in Umbraco preview button remains.
- `PreviewMode` is still honoured **server-side** in `GetPreviewUrlAsync`:
  `DisablePreview` and `UseStandardPreview` cause the provider to return `null` (no headless
  URL), and a globally `Disabled` configuration does the same. The per-node/per-content-type
  settings are still configured via `appsettings.json` or code.
- **`PreviewModeSettings` `NodeIds` now take GUID keys** instead of integer node ids, because
  the Umbraco 17 backoffice no longer surfaces integer ids. The provider resolves the configured
  keys to ids via `IIdKeyMap`, and `IncludeDescendants` is now evaluated precisely per setting
  (a non-descendant setting matches only the node's own key).
- The settings dashboard remains in the **Settings** section and still respects
  "configured from settings file or code" (inputs are locked in that case).

## 6. Build & development

```bash
# Frontend (run when the TypeScript client changes)
cd src/Our.Umbraco.HeadlessPreview/Client
npm install
npm run build          # emits App_Plugins/Our.Umbraco.HeadlessPreview/dashboard.js
# npm run watch        # rebuild on change during development
# npm run typecheck    # tsc --noEmit

# Backend / package
cd ../../..
dotnet build -c Release
dotnet pack src/Our.Umbraco.HeadlessPreview -c Release
```

The compiled `dashboard.js` (+ source map) and `umbraco-package.json` under `App_Plugins`
are part of the NuGet payload, so the frontend must be built before packing.

## 7. Verification performed

- `dotnet build -c Release` — succeeds (0 errors) against Umbraco 17.5.
- `dotnet test -c Release` — **12 / 12 passing** (`TemplateUrlParser` unit tests) on net10.
- `Client` `npm run typecheck` and `npm run build` — both succeed.
- `dotnet pack` — produces a single-target `lib/net10.0` package whose `.nuspec` pins both
  Umbraco dependencies to `[17.0.0, 17.9.9)` and includes the `App_Plugins` payload.

## 8. Follow-ups for a maintainer

- Update the root `README.md` to describe the new "Save and preview ▸ Headless preview"
  option and the new dashboard.
- Decide on a NuGet package `<Version>` for the v17 release (currently defaults to `1.0.0`;
  the client `package.json` is marked `2.0.0`).
- The legacy `build/Our.Umbraco.HeadlessPreview.targets` content-copy is retained; verify it
  against your consuming-site setup (Umbraco 17 also serves `App_Plugins` from the package's
  static web assets).
- Manual smoke test in a running Umbraco 17 site is recommended, particularly slug resolution
  for newly created (never-published) nodes via `IPublishedUrlProvider`.
