using System;
using Microsoft.Extensions.Configuration;
using Our.Umbraco.HeadlessPreview.Extensions;
using Our.Umbraco.HeadlessPreview.Models;
using Umbraco.Cms.Core.Services;

namespace Our.Umbraco.HeadlessPreview.Services
{
    public class PreviewConfigurationService : IPreviewConfigurationService
    {
        private readonly IKeyValueService _keyValueService;
        private readonly IConfiguration _configuration;

        private PreviewConfiguration _previewConfiguration;

        private const string ConfigurationUseUmbracoHostnamesDatabaseKey = "HeadlessPreview+Configuration+UseUmbracoHostnames";
        private const string ConfigurationStaticHostnameDatabaseKey = "HeadlessPreview+Configuration+StaticHostname";
        private const string ConfigurationSecretDatabaseKey = "HeadlessPreview+Configuration+Secret";

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

            if (!configuration.UseUmbracoHostnames && string.IsNullOrWhiteSpace(configuration.StaticHostname))
                return false;

            if (string.IsNullOrWhiteSpace(configuration.Secret))
                return false;

            return true;
        }

        public void Save(PreviewConfiguration configuration)
        {
            if (configuration == null)
            {
                return;
            }

            configuration.StaticHostname = configuration.StaticHostname.TrimEnd('/');
            if (!configuration.UseUmbracoHostnames && !configuration.StaticHostname.IsAbsoluteUrl())
            {
                throw new Exception("Configuration value for StaticHostname must be an absolute url");
            }
            
            _keyValueService.SetValue(ConfigurationUseUmbracoHostnamesDatabaseKey, configuration.UseUmbracoHostnames.ToString());
            _keyValueService.SetValue(ConfigurationStaticHostnameDatabaseKey, configuration.StaticHostname);
            _keyValueService.SetValue(ConfigurationSecretDatabaseKey, configuration.Secret);

            _previewConfiguration = configuration;
        }

        private PreviewConfiguration GetConfigurationFromSettingsFile()
        {
            return _configuration.GetSection("HeadlessPreview").Get<PreviewConfiguration>();
        }

        private PreviewConfiguration GetConfigurationFromDatabase()
        {
            var useUmbracoHostnamesAsString = _keyValueService.GetValue(ConfigurationUseUmbracoHostnamesDatabaseKey);
            var staticHostname = _keyValueService.GetValue(ConfigurationStaticHostnameDatabaseKey);
            var secret = _keyValueService.GetValue(ConfigurationSecretDatabaseKey);

            var configuration = new PreviewConfiguration
            {
                StaticHostname = staticHostname,
                Secret = secret
            };

            if (bool.TryParse(useUmbracoHostnamesAsString, out var useUmbracoHostnames))
            {
                configuration.UseUmbracoHostnames = useUmbracoHostnames;
            }

            return configuration;
        }
    }
}