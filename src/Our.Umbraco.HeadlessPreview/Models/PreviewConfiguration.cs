namespace Our.Umbraco.HeadlessPreview.Models
{
    public class PreviewConfiguration
    {
        public bool UseUmbracoHostnames { get; set; }
        public string StaticHostname { get; set; }
        public string RelativePath { get; set; }
        public string Secret { get; set; }
        public bool ConfiguredFromSettingsFile { get; set; }
    }
}