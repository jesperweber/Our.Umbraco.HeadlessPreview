using System;
using Microsoft.Extensions.Configuration;
using Our.Umbraco.HeadlessPreview.Models;
using Umbraco.Cms.Core.Services;

namespace Our.Umbraco.HeadlessPreview.Services
{
    public class PreviewConfigurationService : IPreviewConfigurationService
    {
        private readonly IKeyValueService _keyValueService;
        private readonly IConfiguration _configuration;

        private PreviewConfiguration _previewConfiguration;

        private const string ConfigurationTemplateUrlDatabaseKey = "HeadlessPreview+Configuration+TemplateUrl";

        public PreviewConfigurationService(IKeyValueService keyValueService, IConfiguration configuration)
        {
            _keyValueService = keyValueService;
            _configuration = configuration;
        }

        public PreviewConfiguration GetConfiguration()
        {
            if (_previewConfiguration != null)
                return _previewConfiguration;

            _previewConfiguration = GetConfigurationFromSettingsFile();
            if (_previewConfiguration != null)
            {
                _previewConfiguration.ConfiguredFromSettingsFile = true;
                return _previewConfiguration;
            }

            _previewConfiguration = GetConfigurationFromDatabase();
            _previewConfiguration.ConfiguredFromSettingsFile = false;

            return _previewConfiguration;
        }

        public bool IsConfigured()
        {
            var configuration = GetConfiguration();

            if (configuration == null)
                return false;

            if (string.IsNullOrWhiteSpace(configuration.TemplateUrl))
                return false;

            return true;
        }

        public void Save(PreviewConfiguration configuration)
        {
            if (configuration == null)
                return;

            _keyValueService.SetValue(ConfigurationTemplateUrlDatabaseKey, configuration.TemplateUrl);

            _previewConfiguration = configuration;
        }

        private PreviewConfiguration GetConfigurationFromSettingsFile()
        {
            var configuration = _configuration.GetSection("HeadlessPreview").Get<PreviewConfiguration>();

            if (configuration is not null)
            {
                configuration.TemplateUrl ??= "{hostname}/api/preview?slug={slug}&secret=MySecret";
            }

            return configuration;
        }

        private PreviewConfiguration GetConfigurationFromDatabase()
        {
            var templateUrl = _keyValueService.GetValue(ConfigurationTemplateUrlDatabaseKey);

            var configuration = new PreviewConfiguration
            {
                TemplateUrl = templateUrl
            };

            return configuration;
        }
    }
}