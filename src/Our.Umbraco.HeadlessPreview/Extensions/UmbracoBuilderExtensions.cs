using System;
using Our.Umbraco.HeadlessPreview.ConfigurationBuilder;
using Umbraco.Cms.Core.DependencyInjection;

namespace Our.Umbraco.HeadlessPreview.Extensions
{
    public static class UmbracoBuilderExtensions
    {
        public static IUmbracoBuilder AddHeadlessPreviewConfiguration(this IUmbracoBuilder builder, Action<HeadlessPreviewBuilderConfiguration> configureUmbracoMiddleware)
        {
            var headlessPreviewBuilderContext = new HeadlessPreviewBuilderConfiguration(builder);
            configureUmbracoMiddleware(headlessPreviewBuilderContext);

            return builder;
        }
    }
}