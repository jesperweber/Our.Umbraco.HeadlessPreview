using Microsoft.Extensions.DependencyInjection;
using Our.Umbraco.HeadlessPreview.Configurators;
using Our.Umbraco.HeadlessPreview.Models;
using Umbraco.Cms.Core.DependencyInjection;

namespace Our.Umbraco.HeadlessPreview.ConfigurationBuilder
{
    public class HeadlessPreviewBuilderConfiguration
    {
        private readonly IUmbracoBuilder _builder;

        public HeadlessPreviewBuilderConfiguration(IUmbracoBuilder builder) => _builder = builder;

        public HeadlessPreviewBuilderConfiguration AddTemplateUrlConfigurator<T>() where T : ITemplateUrlConfigurator
        {
            _builder.Services.AddSingleton(typeof(IConfigurator), typeof(T));

            return this;
        }

        public HeadlessPreviewBuilderConfiguration AddTemplateUrlConfigurator(string templateUrl)
        {
            _builder.Services.AddSingleton(typeof(IConfigurator), new HeadlessPreviewTemplateUrlConfigurator(templateUrl));

            return this;
        }

        public HeadlessPreviewBuilderConfiguration AddDisableConfigurator<T>() where T : IDisableConfigurator
        {
            _builder.Services.AddSingleton(typeof(IConfigurator), typeof(T));

            return this;
        }

        public HeadlessPreviewBuilderConfiguration AddDisableConfigurator(bool disable)
        {
            _builder.Services.AddSingleton(typeof(IConfigurator), new HeadlessPreviewDisableConfigurator(disable));

            return this;
        }

        public HeadlessPreviewBuilderConfiguration AddPreviewModesConfigurator<T>() where T : IPreviewModesConfigurator
        {
            _builder.Services.AddSingleton(typeof(IConfigurator), typeof(T));

            return this;
        }

        public HeadlessPreviewBuilderConfiguration AddPreviewModesConfigurator(IPreviewModeSetting[] previewModes)
        {
            _builder.Services.AddSingleton(typeof(IConfigurator), new HeadlessPreviewPreviewModesConfigurator(previewModes));

            return this;
        }
    }
}