using System;

namespace Our.Umbraco.HeadlessPreview.Models
{
    public class PreviewModeSettingNodeId : IPreviewModeSetting
    {
        public PreviewModeSettingType Type => PreviewModeSettingType.NodeId;
        // [CHANGE: Umbraco 17 - backoffice exposes GUID keys instead of integer ids] Related: HeadlessPreviewUrlProvider.cs, appsettings-schema.headlessPreview.json
        public Guid[] NodeIds { get; set; } = Array.Empty<Guid>();
        public bool IncludeDescendants { get; set; } = false;
        public PreviewMode Mode { get; set; } = PreviewMode.UseHeadlessPreview;
    }
}