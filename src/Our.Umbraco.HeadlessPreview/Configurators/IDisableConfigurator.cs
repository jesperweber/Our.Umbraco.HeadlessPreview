namespace Our.Umbraco.HeadlessPreview.Configurators
{
    public interface IDisableConfigurator : IConfigurator
    {
        bool Configure();
    }
}