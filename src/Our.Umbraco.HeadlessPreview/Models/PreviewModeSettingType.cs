using System.Text.Json.Serialization;

namespace Our.Umbraco.HeadlessPreview.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PreviewModeSettingType
{
    ContentType,
    NodeId
}