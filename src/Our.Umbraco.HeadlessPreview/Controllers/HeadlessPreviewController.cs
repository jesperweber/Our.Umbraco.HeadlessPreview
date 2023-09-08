using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Microsoft.Extensions.Logging;
using Our.Umbraco.HeadlessPreview.Extensions;
using Our.Umbraco.HeadlessPreview.Services;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Attributes;
using Umbraco.Cms.Web.Common.Controllers;
using Our.Umbraco.HeadlessPreview.Models;
using Umbraco.Extensions;

namespace Our.Umbraco.HeadlessPreview.Controllers
{
    [PluginController("headlesspreview")]
    public class HeadlessPreviewController : UmbracoAuthorizedController
    {
        private readonly IUmbracoContextFactory _umbracoContextFactory;
        private readonly IDomainService _domainService;
        private readonly IPreviewConfigurationService _previewConfigurationService;
        private readonly ITemplateUrlParser _templateUrlParser;
        private readonly ILogger<HeadlessPreviewController> _logger;

        public HeadlessPreviewController(IUmbracoContextFactory umbracoContextFactory, IDomainService domainService, 
            IPreviewConfigurationService previewConfigurationService, ITemplateUrlParser templateUrlParser, 
            ILogger<HeadlessPreviewController> logger)
        {
            _umbracoContextFactory = umbracoContextFactory;
            _domainService = domainService;
            _previewConfigurationService = previewConfigurationService;
            _templateUrlParser = templateUrlParser;
            _logger = logger;
        }

        [HttpGet]
        public void Index()
        {
            if (!_previewConfigurationService.IsConfigured())
            {
                _logger.LogError("Headless Preview is not configured.");
                return;
            }

            int.TryParse(HttpContext.Request.Query["id"], out var nodeId);
            var culture = HttpContext.Request.Query["culture"].ToString();

            var previewConfiguration = _previewConfigurationService.GetConfiguration();
            var placeHolders = _templateUrlParser.GetPlaceHolders(previewConfiguration.TemplateUrl);

            var hostname = string.Empty;
            string nodePath;
            using (var contextReference = _umbracoContextFactory.EnsureUmbracoContext())
            {
                var publishedContent = contextReference.UmbracoContext.Content?.GetById(true, nodeId);

                if(publishedContent == null)
                {
                    _logger.LogError($"No content found with id '{nodeId}'");
                    return;
                }

                nodePath = publishedContent?.BuildPathForUnpublishedNode(_umbracoContextFactory); 
                
                if (placeHolders.Contains(TemplateUrlPlaceHolder.Hostname))
                {
                    foreach (var parentOrSelf in publishedContent.AncestorsOrSelf())
                    {
                        var domain = _domainService.GetAssignedDomains(parentOrSelf.Id, false).FirstOrDefault(x => string.IsNullOrWhiteSpace(culture) || x.LanguageIsoCode == culture);
                        hostname = domain?.DomainName;
                    }
                }
            }
            
            var redirectUrl = _templateUrlParser.Parse(previewConfiguration.TemplateUrl, hostname, nodePath);
            
            HttpContext.Response.Redirect(redirectUrl, false);
        }
    }
}