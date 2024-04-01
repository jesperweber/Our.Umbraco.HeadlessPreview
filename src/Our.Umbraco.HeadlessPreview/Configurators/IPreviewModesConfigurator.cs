using Our.Umbraco.HeadlessPreview.Models;

namespace Our.Umbraco.HeadlessPreview.Configurators
{
    public interface IPreviewModesConfigurator : IConfigurator
    {
        IPreviewModeSetting[] Configure();
    }
}