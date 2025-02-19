namespace Our.Umbraco.HeadlessPreview.Models
{
    public interface IPreviewModeSetting
    {
        public PreviewModeSettingType Type { get; }
        public PreviewMode Mode { get; set; }
    }
}