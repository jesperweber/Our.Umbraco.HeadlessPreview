using System;
using System.Linq;
using Our.Umbraco.HeadlessPreview.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;

namespace Our.Umbraco.HeadlessPreview.Extensions
{
    public static class PublishedContentExtensions
    {
        /// <summary>
        /// Unpublished pages don't have a url, so we build it our self
        /// </summary>
        public static Uri BuildUrlForUnpublishedNode(this IPublishedContent publishedContent, PreviewConfiguration previewConfiguration, IUmbracoContextFactory umbracoContextFactory, IDomainService domainService)
        {
            using var contextReference = umbracoContextFactory.EnsureUmbracoContext();

            var contentCache = contextReference.UmbracoContext.Content;
            if (contentCache is null)
                throw new Exception("contentCache is null");

            // The structure of route is: rootNodeId/urlSegment1/urlSegment2/...
            var route = contentCache.GetRouteById(true, publishedContent.Id);
            if (route is null)
                throw new Exception("route is null");

            int.TryParse(route.Substring(0, route.IndexOf('/')), out var rootNodeId);
            var path = route.Substring(route.IndexOf('/'));

            string hostname;
            if (previewConfiguration.UseUmbracoHostnames)
            {
                var domain = domainService.GetAssignedDomains(rootNodeId, false).FirstOrDefault();
                hostname = domain?.DomainName;
            }
            else
            {
                hostname = previewConfiguration.StaticHostname;
            }

            if (string.IsNullOrWhiteSpace(hostname))
                return null;

            return new Uri($"{hostname.TrimEnd('/')}/{path.TrimStart('/')}");
        }
    }
}