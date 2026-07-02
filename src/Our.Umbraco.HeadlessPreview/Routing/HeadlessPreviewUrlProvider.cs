using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Our.Umbraco.HeadlessPreview.Extensions;
using Our.Umbraco.HeadlessPreview.Models;
using Our.Umbraco.HeadlessPreview.Services;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Services;

namespace Our.Umbraco.HeadlessPreview.Routing
{
    // [CHANGE: Umbraco 17 upgrade - replaces the AngularJS preview-button decorator + redirect controller
    //  with the supported "additional preview environments" IUrlProvider.GetPreviewUrlAsync hook]
    // Related: PreviewComposer.cs, PreviewModeResolver.cs, PreviewApiController.cs
    public class HeadlessPreviewUrlProvider : IUrlProvider
    {
        /// <summary>
        /// Must match the client-side workspaceActionMenuItem meta.urlProviderAlias.
        /// </summary>
        public const string ProviderAlias = "headlessPreview";

        private readonly IPreviewConfigurationService _previewConfigurationService;
        private readonly IPreviewModeResolver _previewModeResolver;
        private readonly ITemplateUrlParser _templateUrlParser;
        private readonly IPublishedUrlProvider _publishedUrlProvider;
        private readonly IDomainService _domainService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public HeadlessPreviewUrlProvider(
            IPreviewConfigurationService previewConfigurationService,
            IPreviewModeResolver previewModeResolver,
            ITemplateUrlParser templateUrlParser,
            IPublishedUrlProvider publishedUrlProvider,
            IDomainService domainService,
            IHttpContextAccessor httpContextAccessor)
        {
            _previewConfigurationService = previewConfigurationService;
            _previewModeResolver = previewModeResolver;
            _templateUrlParser = templateUrlParser;
            _publishedUrlProvider = publishedUrlProvider;
            _domainService = domainService;
            _httpContextAccessor = httpContextAccessor;
        }

        public string Alias => ProviderAlias;

        // This provider only contributes a preview URL; published/other URLs are left to Umbraco.
        public UrlInfo? GetUrl(IPublishedContent content, UrlMode mode, string? culture, Uri current) => null;

        public IEnumerable<UrlInfo> GetOtherUrls(int id, Uri current) => Array.Empty<UrlInfo>();

        public Task<UrlInfo?> GetPreviewUrlAsync(IContent content, string? culture, string? segment)
        {
            // Honours configuration, the global disable flag and the per-content-type / per-node modes.
            if (!_previewModeResolver.HeadlessPreviewApplies(content))
                return Task.FromResult<UrlInfo?>(null);

            var configuration = _previewConfigurationService.GetConfiguration();
            var placeHolders = _templateUrlParser.GetPlaceHolders(configuration.TemplateUrl);

            var slug = BuildSlug(content, culture);
            var hostname = placeHolders.Contains(TemplateUrlPlaceHolder.Hostname)
                ? ResolveHostname(content, culture)
                : string.Empty;

            var url = _templateUrlParser.Parse(configuration.TemplateUrl, hostname, slug);

            if (!Uri.TryCreate(url, UriKind.RelativeOrAbsolute, out var uri))
                return Task.FromResult<UrlInfo?>(null);

            // The preview option opens this URL from the backoffice SPA (served under "/umbraco/").
            // A relative URL (e.g. when no domain/hostname is assigned) would otherwise be resolved
            // against that "/umbraco/" base. Root it at the site origin instead so the backoffice
            // path never leaks into the preview URL.
            if (!uri.IsAbsoluteUri)
            {
                var origin = GetSiteOrigin();
                if (origin is null)
                    return Task.FromResult<UrlInfo?>(null);

                uri = new Uri(origin, url);
            }

            return Task.FromResult<UrlInfo?>(new UrlInfo(
                url: uri,
                provider: Alias,
                culture: culture,
                message: null,
                isExternal: true));
        }

        /// <summary>
        /// The scheme + host of the current request (e.g. "https://localhost:44350/"), used to make a
        /// relative preview URL absolute without inheriting the backoffice "/umbraco/" base path.
        /// </summary>
        private Uri? GetSiteOrigin()
        {
            var request = _httpContextAccessor.HttpContext?.Request;
            if (request is null || !request.Host.HasValue)
                return null;

            return new Uri($"{request.Scheme}://{request.Host.Value}/", UriKind.Absolute);
        }

        private string BuildSlug(IContent content, string? culture)
        {
            // The relative path of the page being previewed (without the leading slash).
            var relativeUrl = _publishedUrlProvider.GetUrl(content.Key, UrlMode.Relative, culture, current: null);
            return string.IsNullOrWhiteSpace(relativeUrl) ? string.Empty : relativeUrl.TrimStart('/');
        }

        private string ResolveHostname(IContent content, string? culture)
        {
            // Walk from the node up to the root and return the first assigned domain matching the culture.
            foreach (var ancestorOrSelfId in content.AncestorOrSelfIds())
            {
                var domain = _domainService.GetAssignedDomains(ancestorOrSelfId, false)
                    .FirstOrDefault(x => string.IsNullOrWhiteSpace(culture) || x.LanguageIsoCode == culture);

                if (domain is null)
                    continue;

                return domain.DomainName;
            }

            return string.Empty;
        }
    }
}
