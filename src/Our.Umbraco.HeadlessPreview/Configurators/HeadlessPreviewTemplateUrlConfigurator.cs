namespace Our.Umbraco.HeadlessPreview.Configurators
{
    public class HeadlessPreviewTemplateUrlConfigurator : ITemplateUrlConfigurator
    {
        private readonly string _templateUrl;

        public HeadlessPreviewTemplateUrlConfigurator(string templateUrl)
        {
            _templateUrl = templateUrl;
        }

        public string Configure()
        {
            return _templateUrl;
        }
    }
}