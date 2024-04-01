using System;

namespace Our.Umbraco.HeadlessPreview.Models
{
    public class PreviewModeSettingContentType : IPreviewModeSetting
    {
        public PreviewModeSettingType Type => PreviewModeSettingType.ContentType;
        public string[] ContentTypes { get; set; } = Array.Empty<string>();
        public PreviewMode Mode { get; set; } = PreviewMode.UseHeadlessPreview;
    }
}