using NUnit.Framework;
using Our.Umbraco.HeadlessPreview.Models;
using Our.Umbraco.HeadlessPreview.Services;

namespace Our.Umbraco.HeadlessPreview.Tests.Services;

public class TemplateUrlParserTest
{
    [Test]
    [TestCase("https://test.local/api/preview?slug={slug}", ExpectedResult = new[] { TemplateUrlPlaceHolder.Slug })]
    [TestCase("https://test.local/api/preview?slug={SLUG}", ExpectedResult = new[] { TemplateUrlPlaceHolder.Slug })]
    [TestCase("{hostname}/api/preview", ExpectedResult = new[] { TemplateUrlPlaceHolder.Hostname })]
    [TestCase("{HOSTNAME}/api/preview", ExpectedResult = new[] { TemplateUrlPlaceHolder.Hostname })]
    [TestCase("{hostname}/api/preview?slug={slug}", ExpectedResult = new[] { TemplateUrlPlaceHolder.Hostname, TemplateUrlPlaceHolder.Slug })]
    [TestCase("{HOSTNAME}/api/preview?slug={SLUG}", ExpectedResult = new [] { TemplateUrlPlaceHolder.Hostname, TemplateUrlPlaceHolder.Slug })]
    public TemplateUrlPlaceHolder[] GetPlaceHolders_Returns_Placeholders(string templateUrl)
    {
        var subject = new TemplateUrlParser();

        var result = subject.GetPlaceHolders(templateUrl);

        return result;
    }

    [Test]
    [TestCase("https://test.local/api/preview?slug={slug}", null, "/testpage", ExpectedResult = "https://test.local/api/preview?slug=/testpage")]
    [TestCase("https://test.local/api/preview?slug={SLUG}", null, "/testpage", ExpectedResult = "https://test.local/api/preview?slug=/testpage")]
    [TestCase("{hostname}/api/preview", "https://test.local", null, ExpectedResult = "https://test.local/api/preview")]
    [TestCase("{HOSTNAME}/api/preview", "https://test.local", null, ExpectedResult = "https://test.local/api/preview")]
    [TestCase("{hostname}/api/preview?slug={slug}", "https://test.local", "/testpage", ExpectedResult = "https://test.local/api/preview?slug=/testpage")]
    [TestCase("{HOSTNAME}/api/preview?slug={SLUG}", "https://test.local", "/testpage", ExpectedResult = "https://test.local/api/preview?slug=/testpage")]
    public string Parse_Returns_Parsed_Url(string templateUrl, string hostname, string slug)
    {
        var subject = new TemplateUrlParser();

        var result = subject.Parse(templateUrl, hostname, slug);

        return result;
    }
}