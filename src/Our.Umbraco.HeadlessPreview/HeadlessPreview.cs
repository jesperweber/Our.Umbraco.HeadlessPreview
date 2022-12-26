using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Our.Umbraco.HeadlessPreview.Extensions;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;

namespace Our.Umbraco.HeadlessPreview
{
    public class HeadlessPreview
    {
        private readonly RequestDelegate _next;

        public HeadlessPreview(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IUmbracoContextFactory umbracoContextFactory, IDomainService domainService)
        {
            if (!context.Request.Path.StartsWithSegments("/headless/preview"))
            {
                await _next(context);
                return;
            }

            int.TryParse(context.Request.Query["id"], out var nodeId);
            
            Uri uri;
            using (var contextReference = umbracoContextFactory.EnsureUmbracoContext())
            {
                var publishedContent = contextReference.UmbracoContext.Content?.GetById(true, nodeId);

                uri = publishedContent?.BuildUrlForUnpublishedNode(umbracoContextFactory, domainService);
            }

            if (uri == null)
            {
                await context.Response.WriteAsync("No domain has been set for the Umbraco site. Set a domain in Culture and Hostnames for the site root node.");
                return;
            }

            var domain = uri.GetLeftPart(UriPartial.Authority);
            var path = uri.AbsolutePath.TrimEnd('/');

            //var basicAuthentication = $"Basic {_settings.PreviewToken.Base64Encode()}";
            //context.Response.Redirect($"{domain}/api/preview?slug={path}&auth={basicAuthentication}", false);
            context.Response.Redirect($"{domain}/api/preview?slug={path}", false);
        }
    }
}