using System;

namespace Our.Umbraco.HeadlessPreview.Models
{
    public class PreviewConfiguration
    {
        public string TemplateUrl { get; set; } = "{hostname}/api/preview?slug={slug}&secret=MySecret";
        public IPreviewModeSetting[] PreviewModeSettings { get; set; } = Array.Empty<IPreviewModeSetting>();
        public bool Disabled { get; set; } = false;
        public bool ConfiguredFromSettingsFileOrCode { get; set; }
    }
}