using Our.Umbraco.HeadlessPreview.Models;

namespace Our.Umbraco.HeadlessPreview.Services
{
    public interface IPreviewConfigurationService
    {
        PreviewConfiguration GetConfiguration();
        bool IsConfigured();
        void Save(PreviewConfiguration configuration);
    }
}