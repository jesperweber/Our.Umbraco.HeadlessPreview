using System;

namespace Our.Umbraco.HeadlessPreview.Models
{
    public class PreviewModeSettingNodeId : IPreviewModeSetting
    {
        public PreviewModeSettingType Type => PreviewModeSettingType.NodeId;
        public int[] NodeIds { get; set; } = Array.Empty<int>();
        public bool IncludeDescendants { get; set; } = false;
        public PreviewMode Mode { get; set; } = PreviewMode.UseHeadlessPreview;
    }
}