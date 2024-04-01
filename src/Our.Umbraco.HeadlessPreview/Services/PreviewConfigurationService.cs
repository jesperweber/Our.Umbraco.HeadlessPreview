using System;
using Microsoft.Extensions.Configuration;
using Our.Umbraco.HeadlessPreview.Configurators;
using Our.Umbraco.HeadlessPreview.Models;
using System.Collections.Generic;
using System.Linq;
using Umbraco.Cms.Core.Services;

namespace Our.Umbraco.HeadlessPreview.Services
{
    public class PreviewConfigurationService : IPreviewConfigurationService
    {
        private readonly IEnumerable<IConfigurator> _configurators;
        private readonly IKeyValueService _keyValueService;
        private readonly IConfiguration _configuration;

        private PreviewConfiguration _previewConfiguration;

        private const string ConfigurationTemplateUrlDatabaseKey = "HeadlessPreview+Configuration+TemplateUrl";
        private const string ConfigurationDisabledDatabaseKey = "HeadlessPreview+Configuration+Disabled";

        public PreviewConfigurationService(IKeyValueService keyValueService, IConfiguration configuration, IEnumerable<IConfigurator> configurators)
        {
            _configurators = configurators;
            _keyValueService = keyValueService;
            _configuration = configuration;
        }

        public PreviewConfiguration GetConfiguration()
        {
            if (_previewConfiguration is not null)
                return _previewConfiguration;

            _previewConfiguration = GetConfigurationFromSettingsFile();
            if (_previewConfiguration is not null)
                _previewConfiguration.ConfiguredFromSettingsFileOrCode = true;

            _previewConfiguration = SetConfigurationFromCode(_previewConfiguration);
            if (_previewConfiguration is not null)
            {
                _previewConfiguration.ConfiguredFromSettingsFileOrCode = true;
                return _previewConfiguration;
            }

            _previewConfiguration = GetConfigurationFromDatabase();
            _previewConfiguration.ConfiguredFromSettingsFileOrCode = false;

            return _previewConfiguration;
        }

        public bool IsConfigured()
        {
            var configuration = GetConfiguration();

            if (configuration is null)
                return false;

            if (string.IsNullOrWhiteSpace(configuration.TemplateUrl))
                return false;

            return true;
        }

        public void Save(PreviewConfiguration configuration)
        {
            if (configuration is null)
                return;

            _keyValueService.SetValue(ConfigurationTemplateUrlDatabaseKey, configuration.TemplateUrl);
            _keyValueService.SetValue(ConfigurationDisabledDatabaseKey, configuration.Disabled.ToString());

            _previewConfiguration = configuration;
        }

        private PreviewConfiguration GetConfigurationFromSettingsFile()
        {
            var previewSettings = _configuration.GetSection("HeadlessPreview").Get<PreviewConfiguration>();

            if (previewSettings is not null)
            {
                previewSettings.PreviewModeSettings = GetPreviewModeSettings();
            }

            return previewSettings;
        }

        private PreviewConfiguration GetConfigurationFromDatabase()
        {
            var templateUrl = _keyValueService.GetValue(ConfigurationTemplateUrlDatabaseKey);
            bool.TryParse(_keyValueService.GetValue(ConfigurationDisabledDatabaseKey), out var disabled);

            var configuration = new PreviewConfiguration
            {
                TemplateUrl = templateUrl,
                Disabled = disabled
            };

            return configuration;
        }

        private PreviewConfiguration SetConfigurationFromCode(PreviewConfiguration previewConfiguration)
        {
            if (_configurators.FirstOrDefault(x => x is ITemplateUrlConfigurator) is ITemplateUrlConfigurator templateUrlConfigurator)
            {
                previewConfiguration ??= new PreviewConfiguration();
                previewConfiguration.TemplateUrl = templateUrlConfigurator.Configure();
            }

            if (_configurators.FirstOrDefault(x => x is IDisableConfigurator) is IDisableConfigurator disableConfigurator)
            {
                previewConfiguration ??= new PreviewConfiguration();
                previewConfiguration.Disabled = disableConfigurator.Configure();
            }

            if (_configurators.FirstOrDefault(x => x is IPreviewModesConfigurator) is IPreviewModesConfigurator previewModeConfigurator)
            {
                previewConfiguration ??= new PreviewConfiguration();
                previewConfiguration.PreviewModeSettings = previewModeConfigurator.Configure();
            }

            return previewConfiguration;
        }

        private IPreviewModeSetting[] GetPreviewModeSettings()
        {
            var previewModeSettings = new List<IPreviewModeSetting>();

            for (var i = 0; ; i++)
            {
                var root = $"HeadlessPreview:PreviewModeSettings:{i}";

                var type = _configuration.GetValue<string>($"{root}:Type");
                if (type == null)
                    break;

                if (!Enum.TryParse(type, true, out PreviewModeSettingType typeEnum))
                {
                    throw new InvalidOperationException($"Unknown or missing preview mode type '{type}'");
                }

                IPreviewModeSetting previewModeSetting = typeEnum switch
                {
                    PreviewModeSettingType.ContentType => new PreviewModeSettingContentType(),
                    PreviewModeSettingType.NodeId => new PreviewModeSettingNodeId(),
                    _ => throw new ArgumentOutOfRangeException($"{typeEnum} is not supported.")
                };

                _configuration.GetSection($"{root}").Bind(previewModeSetting);
                previewModeSettings.Add(previewModeSetting);
            }

            return previewModeSettings.ToArray();
        }
    }
}