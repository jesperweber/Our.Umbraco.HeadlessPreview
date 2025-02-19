[![CI-CD](https://github.com/jesperweber/Our.Umbraco.HeadlessPreview/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/jesperweber/Our.Umbraco.HeadlessPreview/actions/workflows/ci-cd.yml) 
[![NuGet](https://img.shields.io/nuget/v/Our.Umbraco.HeadlessPreview)](https://www.nuget.org/packages/Our.Umbraco.HeadlessPreview)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/jesperweber/Our.Umbraco.HeadlessPreview/pulls)

# Our.Umbraco.HeadlessPreview

This package overrides the default Umbraco preview button and lets you configure an alternative preview url. This way editors can easily access preview in a headless setup.

You can set different modes for the preview button, depending on your needs (headless preview, standard Umbraco preview or no preview).

## Installation

Install the NuGet package to get started.

### Install the NuGet package

With .NET CLI

```bash
dotnet add package Our.Umbraco.HeadlessPreview --version <version>
```

Using the Package Manager

```bash
Install-Package Our.Umbraco.HeadlessPreview -Version <version>
```

## Configuration

The package can be configured by code, using the `appsetings.json` file or using the UI which will save the configuration in the database.


| Setting               | Default value     | Description |
|----------             |-------------      |------ |
| `TemplateUrl`         | ``                | The URL used for preview. It can contain dynamic [placeholder](#placeholders) values to support different types of URL's.<br /><br />Typically used template URL are:<br/><br/><ul><li>https://mysite.com/api/preview?slug=\{slug\}&secret=mySecret</li><li>\{hostname\}/api/preview?slug=\{slug\}&secret=mySecret</li><li>https://mysite.com/\{slug\}?preview=true</li></ul> |
| `Disable`             | false             | Disables the headless preview for all nodes and uses standard Umbraco preview. |
| `PreviewModeSettings` | []                | Lets you configure how the preview button works based on content types or node ids.<br /><br />Possible preview modes:<br /><br /><ul><li>UseHeadlessPreview - Uses the headless preview functionality. The default setting</li><li>UseStandardPreview - Uses the default Umbraco preview functionality</li><li>DisablePreview - Removes the preview button</li></ul><br />The `previewModeSettings` is an array of preview mode config objects and the objects are evaluated in the order they are registered. For each content node, the preview mode for the first matching config object is used.<br /><br /><i>Note: This settings can't be configured in by code or in the appsettings.json file.</i> |

### UI

If you just have a single environment it's easy to just configure the plugin directly from the Umbraco Backoffice in the Settings section.

![Configuration](https://raw.githubusercontent.com/jesperweber/Our.Umbraco.HeadlessPreview/main/screenshots/SettingsV2-2.png "Headless Preview Settings")

### appsettings.json
This is typically the preferred way if you have a multi environment setup as you can use environment specific settings.

``` json
"HeadlessPreview": {
    "TemplateUrl": "https://mysite.com/api/preview?slug={slug}&secret=mySecret",
    "Disable": false,
    "PreviewModeSettings": [
      {
        "Type": "NodeId",
        "NodeIds": [ 1058 ],
        "IncludeDescendants": true,
        "Mode": "UseStandardPreview"
      },
      {
        "Type": "ContentType",
        "ContentTypes": [ "settings" ],
        "Mode": "DisablePreview"
      }
    ]
}
```

### Code
Configuration by code is done in the `Startup.cs` file. For simple configuration you can set the configuration values directly in the config registration:

``` csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddUmbraco(_env, _config)
        .AddBackOffice()
        .AddWebsite()
        .AddDeliveryApi()
        .AddComposers()
        .AddHeadlessPreviewConfiguration(x => x
            .AddTemplateUrlConfigurator("https://mysite.com/api/preview?slug={slug}&secret=mySecret")
            .AddDisableConfigurator(false)
            .AddPreviewModeSettingsConfigurator([
                new PreviewModeContentTypeSetting { ContentTypes = ["settings"], Mode = PreviewMode.DisablePreview }
            ])
        )
        .Build();
}
```

For more complex configuration you can build your own configurator classes by implementing `ITemplateUrlConfigurator`, `IDisableConfigurator`, or `IPreviewModeSettingsConfigurator` and register them like below:

``` csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddUmbraco(_env, _config)
        .AddBackOffice()
        .AddWebsite()
        .AddDeliveryApi()
        .AddComposers()
        .AddHeadlessPreviewConfiguration(x => x
            .AddTemplateUrlConfigurator<MyTemplateUrlConfigurator>()
            .AddDisableConfigurator<MyDisableConfigurator>()
            .AddPreviewModeSettingsConfigurator<MyPreviewModeSettingsConfigurator>()
        )
        .Build();
}
```

Configurator class example:
``` csharp
// Supports dependency injection if you need other services to build your template url
public class MyTemplateUrlConfigurator : ITemplateUrlConfigurator
{
    public string Configure()
    {
        // custom logic to build template url
        return "https://mysite.com/api/preview?slug={slug}&secret=mySecret";
    }
}
```

## Placeholders

Placeholders are predefined keys enclosed in curly braces that you can use in your tempalte URL. Placeholders are automatically replaced with real values based on the page you are previewing.


| Placeholder           | Description |
|----------             |------ |
| `{hostname}`          | The hostname added on nearest ancestor node or self with the right culture in Umbraco. If multiple hostname has same culture it takes the first. |
| `{slug}`              | The relative path of the page being previewed. |

## Changelog

See new features, fixes and breaking changes for each [Release](https://github.com/jesperweber/Our.Umbraco.HeadlessPreview/releases).


## Contributing

Pull requests are very welcome.  

Please fork this repository and make a PR when you are ready.  

Otherwise you are welcome to open an Issue in our [issue tracker](https://github.com/jesperweber/Our.Umbraco.HeadlessPreview/issues).


## License

Our.Umbraco.HeadlessPreview is [MIT licensed](https://github.com/jesperweber/Our.Umbraco.HeadlessPreview/blob/main/LICENSE)
