using Microsoft.Extensions.DependencyInjection;
using Our.Umbraco.HeadlessPreview.Services;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace Our.Umbraco.HeadlessPreview.Composers
{
    public class PreviewComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddSingleton<IPreviewConfigurationService, PreviewConfigurationService>();
        }
    }
}