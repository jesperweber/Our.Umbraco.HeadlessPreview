using System;
using System.Linq;
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
        public static Uri BuildUrlForUnpublishedNode(this IPublishedContent publishedContent, IUmbracoContextFactory umbracoContextFactory, IDomainService domainService)
        {
            using var contextReference = umbracoContextFactory.EnsureUmbracoContext();

            var contentCache = contextReference.UmbracoContext.Content;
            if (contentCache is null)
                throw new Exception("contentCache is null");

            var originalRequestUrl = contextReference.UmbracoContext.OriginalRequestUrl;

            // The structure of route is: rootNodeId/urlSegment1/urlSegment2/...
            var route = contentCache.GetRouteById(true, publishedContent.Id);
            if (route is null)
                throw new Exception("route is null");

            int.TryParse(route.Substring(0, route.IndexOf('/')), out var rootNodeId);
            var path = route.Substring(route.IndexOf('/'));

            var domain = domainService.GetAssignedDomains(rootNodeId, false).FirstOrDefault();

            return domain == null
                ? new Uri($"{originalRequestUrl.GetLeftPart(UriPartial.Authority)}/{path.TrimStart('/')}")
                : new Uri($"{domain.DomainName.TrimEnd('/')}/{path.TrimStart('/')}");
        }
    }
}