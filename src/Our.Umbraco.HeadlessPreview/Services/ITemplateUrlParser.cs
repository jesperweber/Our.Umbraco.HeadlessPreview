using Our.Umbraco.HeadlessPreview.Models;

namespace Our.Umbraco.HeadlessPreview.Services
{
    public interface ITemplateUrlParser
    {
        string Parse(string templateUrl, string hostname, string slug);
        TemplateUrlPlaceHolder[] GetPlaceHolders(string templateUrl);
    }
}