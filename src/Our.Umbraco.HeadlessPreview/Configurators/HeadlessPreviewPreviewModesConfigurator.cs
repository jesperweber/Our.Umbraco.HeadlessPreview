using Our.Umbraco.HeadlessPreview.Models;

namespace Our.Umbraco.HeadlessPreview.Configurators
{
    public class HeadlessPreviewPreviewModesConfigurator : IPreviewModesConfigurator
    {
        private readonly IPreviewModeSetting[] _previewModeSettings;

        public HeadlessPreviewPreviewModesConfigurator(IPreviewModeSetting[] previewModeSettings)
        {
            _previewModeSettings = previewModeSettings;
        }

        public IPreviewModeSetting[] Configure()
        {
            return _previewModeSettings;
        }
    }
}