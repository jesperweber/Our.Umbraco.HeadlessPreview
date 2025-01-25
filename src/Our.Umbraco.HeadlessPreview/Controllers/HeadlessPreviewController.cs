using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Our.Umbraco.HeadlessPreview.Extensions;
using Our.Umbraco.HeadlessPreview.Models;
using Our.Umbraco.HeadlessPreview.Services;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Attributes;
using Umbraco.Cms.Web.Common.Controllers;
using Umbraco.Extensions;

namespace Our.Umbraco.HeadlessPreview.Controllers;

[PluginController("headlesspreview")]
public class HeadlessPreviewController(
    IUmbracoContextFactory umbracoContextFactory,
    IDomainService domainService,
    IPreviewConfigurationService previewConfigurationService,
    ITemplateUrlParser templateUrlParser,
    ILogger<HeadlessPreviewController> logger)
    : UmbracoAuthorizedController
{
    [HttpGet]
    public async Task Index()
    {
        if (!previewConfigurationService.IsConfigured())
        {
            logger.LogError("Headless Preview is not configured.");
            return;
        }

        Guid.TryParse(HttpContext.Request.Query["guid"], out var nodeGuid);
        var culture = HttpContext.Request.Query["culture"].ToString();

        var previewConfiguration = previewConfigurationService.GetConfiguration();
        var placeHolders = templateUrlParser.GetPlaceHolders(previewConfiguration.TemplateUrl);

        var hostname = string.Empty;
        string nodePath;
        using (var contextReference = umbracoContextFactory.EnsureUmbracoContext())
        {
            var publishedContent = contextReference.UmbracoContext.Content.GetById(true, nodeGuid);

            if(publishedContent == null)
            {
                logger.LogError($"No content found with guid '{nodeGuid}'");
                return;
            }

            nodePath = publishedContent.BuildPathForUnpublishedNode(umbracoContextFactory, culture); 
                
            if (placeHolders.Contains(TemplateUrlPlaceHolder.Hostname))
            {
                foreach (var parentOrSelf in publishedContent.AncestorsOrSelf())
                {
                    var domain = (await domainService.GetAssignedDomainsAsync(parentOrSelf.Key, false)).FirstOrDefault(x => string.IsNullOrWhiteSpace(culture) || x.LanguageIsoCode == culture);
                    hostname = domain?.DomainName;
                }
            }
        }
            
        var redirectUrl = templateUrlParser.Parse(previewConfiguration.TemplateUrl, hostname, nodePath);
            
        HttpContext.Response.Redirect(redirectUrl, false);
    }
}