using Microsoft.Extensions.DependencyInjection;
using Our.Umbraco.HeadlessPreview.Routing;
using Our.Umbraco.HeadlessPreview.Services;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Extensions;

namespace Our.Umbraco.HeadlessPreview.Composers
{
    // [CHANGE: Umbraco 17 upgrade - removed the UmbracoPipelineFilter/MapUmbracoRoute redirect endpoint
    //  (preview is now produced by the IUrlProvider); registers the preview url provider]
    // Related: HeadlessPreviewUrlProvider.cs, PreviewApiController.cs
    public class PreviewComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddSingleton<ITemplateUrlParser, TemplateUrlParser>();
            builder.Services.AddSingleton<IPreviewConfigurationService, PreviewConfigurationService>();
            builder.Services.AddSingleton<IPreviewModeResolver, PreviewModeResolver>();

            // Registers the headless preview URL provider used by the "Save and preview" option.
            builder.AddUrlProvider<HeadlessPreviewUrlProvider>();
        }
    }
}
