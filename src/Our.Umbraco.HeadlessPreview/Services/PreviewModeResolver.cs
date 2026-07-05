using System.Linq;
using Our.Umbraco.HeadlessPreview.Extensions;
using Our.Umbraco.HeadlessPreview.Models;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;

namespace Our.Umbraco.HeadlessPreview.Services
{
    // [CHANGE: Umbraco 17 upgrade - extracted from HeadlessPreviewUrlProvider so the management API
    //  can answer "does headless preview apply" for the visibility condition] Related: HeadlessPreviewUrlProvider.cs, PreviewApiController.cs
    public class PreviewModeResolver : IPreviewModeResolver
    {
        private readonly IPreviewConfigurationService _previewConfigurationService;
        private readonly IIdKeyMap _idKeyMap;

        public PreviewModeResolver(IPreviewConfigurationService previewConfigurationService, IIdKeyMap idKeyMap)
        {
            _previewConfigurationService = previewConfigurationService;
            _idKeyMap = idKeyMap;
        }

        public bool HeadlessPreviewApplies(IContent content)
        {
            if (!_previewConfigurationService.IsConfigured())
                return false;

            var configuration = _previewConfigurationService.GetConfiguration();
            if (configuration is null || configuration.Disabled)
                return false;

            return Resolve(configuration, content) == PreviewMode.UseHeadlessPreview;
        }

        public PreviewMode Resolve(IContent content)
            => Resolve(_previewConfigurationService.GetConfiguration(), content);

        private PreviewMode Resolve(PreviewConfiguration? configuration, IContent content)
        {
            if (configuration?.PreviewModeSettings is null || configuration.PreviewModeSettings.Length == 0)
                return PreviewMode.UseHeadlessPreview;

            var contentTypeAlias = content.ContentType.Alias;
            var ancestorOrSelfIds = content.AncestorOrSelfIds().ToArray();

            // The first matching setting (in registration order) wins.
            foreach (var setting in configuration.PreviewModeSettings)
            {
                var matches = setting switch
                {
                    PreviewModeSettingContentType contentTypeSetting => contentTypeSetting.ContentTypes.Contains(contentTypeAlias),
                    PreviewModeSettingNodeId nodeIdSetting => NodeIdSettingMatches(nodeIdSetting, content, ancestorOrSelfIds),
                    _ => false,
                };

                if (matches)
                    return setting.Mode;
            }

            return PreviewMode.UseHeadlessPreview;
        }

        private bool NodeIdSettingMatches(PreviewModeSettingNodeId setting, IContent content, int[] ancestorOrSelfIds)
        {
            // The configured NodeIds are GUID keys (Umbraco 17 backoffice no longer surfaces integer ids);
            // resolve them to integer ids so they can be matched against the content's path.
            var configuredIds = setting.NodeIds
                .Select(key => _idKeyMap.GetIdForKey(key, UmbracoObjectTypes.Document))
                .Where(attempt => attempt.Success)
                .Select(attempt => attempt.Result)
                .ToArray();

            if (configuredIds.Length == 0)
                return false;

            return setting.IncludeDescendants
                ? configuredIds.Intersect(ancestorOrSelfIds).Any()
                : configuredIds.Contains(content.Id);
        }
    }
}
