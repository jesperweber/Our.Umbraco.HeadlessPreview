using System;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;

namespace Our.Umbraco.HeadlessPreview.Extensions
{
    public static class PublishedContentExtensions
    {
        /// <summary>
        /// Unpublished pages don't have a url, so we build it our self
        /// </summary>
        public static string BuildPathForUnpublishedNode(this IPublishedContent publishedContent, IUmbracoContextFactory umbracoContextFactory)
        {
            using var contextReference = umbracoContextFactory.EnsureUmbracoContext();

            var contentCache = contextReference.UmbracoContext.Content;
            if (contentCache is null)
                throw new Exception("contentCache is null");

            // The structure of route is: rootNodeId/urlSegment1/urlSegment2/...
            var route = contentCache.GetRouteById(true, publishedContent.Id);
            if (route is null)
                throw new Exception("route is null");

            int.TryParse(route.Substring(0, route.IndexOf('/')), out _);
            var path = route.Substring(route.IndexOf('/'));

            return path.TrimStart('/');
        }
    }
}