using System.Text.Json.Serialization;

namespace Our.Umbraco.HeadlessPreview.Models
{
    [JsonDerivedType(typeof(PreviewModeSettingContentType))]
    [JsonDerivedType(typeof(PreviewModeSettingNodeId))]
    public interface IPreviewModeSetting
    {
        public PreviewModeSettingType Type { get; }
        public PreviewMode Mode { get; set; }
    }
}