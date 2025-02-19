namespace Our.Umbraco.HeadlessPreview.Configurators
{
    public class HeadlessPreviewDisableConfigurator : IDisableConfigurator
    {
        private readonly bool _disable;

        public HeadlessPreviewDisableConfigurator(bool disable)
        {
            _disable = disable;
        }

        public bool Configure()
        {
            return _disable;
        }
    }
}