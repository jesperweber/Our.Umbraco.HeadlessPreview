using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Our.Umbraco.HeadlessPreview.Controllers;
using Our.Umbraco.HeadlessPreview.Services;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Configuration.Models;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Web.Common.ApplicationBuilder;
using Umbraco.Cms.Core.Hosting;
using Umbraco.Extensions;

namespace Our.Umbraco.HeadlessPreview.Composers
{
    public class PreviewComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.Configure<UmbracoPipelineOptions>(options =>
            {
                options.AddFilter(new UmbracoPipelineFilter(nameof(HeadlessPreviewController))
                {
                    Endpoints = app => app.UseEndpoints(endpoints =>
                    {
                        var globalSettings = app.ApplicationServices.GetRequiredService<IOptions<GlobalSettings>>().Value;
                        var hostingEnvironment = app.ApplicationServices.GetRequiredService<IHostingEnvironment>();
                        var backofficeArea = Constants.Web.Mvc.BackOfficePathSegment;

                        var rootSegment = $"{globalSettings.GetUmbracoMvcArea(hostingEnvironment)}/{backofficeArea}";
                        var areaName = "headlessPreview";
                        endpoints.MapUmbracoRoute<HeadlessPreviewController>(rootSegment, areaName, null);
                    })
                });
            });

            builder.Services.AddSingleton<IPreviewConfigurationService, PreviewConfigurationService>();
        }
    }
}