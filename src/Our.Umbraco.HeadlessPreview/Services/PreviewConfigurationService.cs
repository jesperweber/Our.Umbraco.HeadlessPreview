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
        
        private readonly string _configurationUseUmbracoHostnamesDatabaseKey = "Preview+Configuration+UseUmbracoHostnames";
        private readonly string _configurationStaticHostnameDatabaseKey = "Preview+Configuration+StaticHostname";
        private readonly string _configurationSecretDatabaseKey = "Preview+Configuration+Secret";

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
            
            _keyValueService.SetValue(_configurationUseUmbracoHostnamesDatabaseKey, configuration.UseUmbracoHostnames.ToString());
            _keyValueService.SetValue(_configurationStaticHostnameDatabaseKey, configuration.StaticHostname);
            _keyValueService.SetValue(_configurationSecretDatabaseKey, configuration.Secret);

            _previewConfiguration = configuration;
        }

        private PreviewConfiguration GetConfigurationFromSettingsFile()
        {
            return _configuration.GetSection("Preview").Get<PreviewConfiguration>();
        }

        private PreviewConfiguration GetConfigurationFromDatabase()
        {
            var useUmbracoHostnamesAsString = _keyValueService.GetValue(_configurationUseUmbracoHostnamesDatabaseKey);
            var staticHostname = _keyValueService.GetValue(_configurationStaticHostnameDatabaseKey);
            var secret = _keyValueService.GetValue(_configurationSecretDatabaseKey);

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