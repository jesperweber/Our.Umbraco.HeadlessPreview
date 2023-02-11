using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using Our.Umbraco.HeadlessPreview.Extensions;
using Our.Umbraco.HeadlessPreview.Services;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Attributes;
using Umbraco.Cms.Web.Common.Controllers;

namespace Our.Umbraco.HeadlessPreview.Controllers
{
    [PluginController("headlesspreview")]
    public class HeadlessPreviewController : UmbracoAuthorizedController
    {
        private readonly IUmbracoContextFactory _umbracoContextFactory;
        private readonly IDomainService _domainService;
        private readonly IPreviewConfigurationService _previewConfigurationService;
        private readonly ILogger<HeadlessPreviewController> _logger;

        public HeadlessPreviewController(IUmbracoContextFactory umbracoContextFactory, IDomainService domainService, 
            IPreviewConfigurationService previewConfigurationService, ILogger<HeadlessPreviewController> logger)
        {
            _umbracoContextFactory = umbracoContextFactory;
            _domainService = domainService;
            _previewConfigurationService = previewConfigurationService;
            _logger = logger;
        }

        [HttpGet]
        public async Task Index()
        {
            if (!_previewConfigurationService.IsConfigured())
            {
                _logger.LogError("Headless Preview is not configured.");
                return;
            }

            int.TryParse(HttpContext.Request.Query["id"], out var nodeId);

            var previewConfiguration = _previewConfigurationService.GetConfiguration();

            Uri uri;
            using (var contextReference = _umbracoContextFactory.EnsureUmbracoContext())
            {
                var publishedContent = contextReference.UmbracoContext.Content?.GetById(true, nodeId);
                uri = publishedContent?.BuildUrlForUnpublishedNode(previewConfiguration, _umbracoContextFactory, _domainService);
            }

            if (uri == null)
            {
                _logger.LogError("No domain has been set for the Umbraco site. Set a domain in Culture and Hostnames for the site root node.");
                await HttpContext.Response.WriteAsync("No domain has been set for the Umbraco site. Set a domain in Culture and Hostnames for the site root node.");
                return;
            }

            var domain = uri.GetLeftPart(UriPartial.Authority);
            var path = uri.AbsolutePath.TrimEnd('/');

            var parametersToAdd = new Dictionary<string, string> { { "slug", path } };
            if(!string.IsNullOrWhiteSpace(previewConfiguration.Secret))
                parametersToAdd.Add("secret", previewConfiguration.Secret);
            
            var redirectUrl = QueryHelpers.AddQueryString($"{domain}/api/preview", parametersToAdd);
            
            HttpContext.Response.Redirect(redirectUrl, false);
        }
    }
}