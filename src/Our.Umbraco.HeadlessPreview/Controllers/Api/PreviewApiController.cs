using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using Microsoft.AspNetCore.Mvc;
using Our.Umbraco.HeadlessPreview.Models;
using Our.Umbraco.HeadlessPreview.Models.Api;
using Our.Umbraco.HeadlessPreview.Services;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.BackOffice.Filters;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;

namespace Our.Umbraco.HeadlessPreview.Controllers.Api
{
    [JsonCamelCaseFormatter]
    public class PreviewApiController : UmbracoAuthorizedApiController
    {
        private readonly IPreviewConfigurationService _previewConfigurationService;
        private readonly IUmbracoContextFactory _umbracoContextFactory;

        public PreviewApiController(IPreviewConfigurationService previewConfigurationService, IUmbracoContextFactory umbracoContextFactory)
        {
            _previewConfigurationService = previewConfigurationService;
            _umbracoContextFactory = umbracoContextFactory;
        }

        [HttpGet]
        public ApiResponse<PreviewConfiguration> GetConfiguration()
        {
            var config = _previewConfigurationService.GetConfiguration();
            return new ApiResponse<PreviewConfiguration>
            {
                Data = config,
                IsSuccess = true
            };
        }

        [HttpGet]
        public ApiResponse<PreviewModeResponse> GetPreviewMode(int nodeId, string contentTypeAlias)
        {
            var config = _previewConfigurationService.GetConfiguration();

            if (config.Disabled)
            {
                return new ApiResponse<PreviewModeResponse>
                {
                    Data = new PreviewModeResponse { PreviewMode = PreviewMode.UseStandardPreview },
                    IsSuccess = true
                };
            }

            var ancestorsOrSelfIds = new List<int>{ nodeId };
            if (config.PreviewModeSettings.Any(x => x is PreviewModeSettingNodeId {IncludeDescendants: true}))
            {
                using var umbracoContextReference = _umbracoContextFactory.EnsureUmbracoContext();
                var node = umbracoContextReference.UmbracoContext.Content.GetById(nodeId);
                ancestorsOrSelfIds.AddRange(node.Ancestors().Select(x => x.Id));
            }

            var previewMode = config.PreviewModeSettings.FirstOrDefault(x 
                                   => x is PreviewModeSettingContentType contentTypeSetting && contentTypeSetting.ContentTypes.Contains(contentTypeAlias)
                                    || x is PreviewModeSettingNodeId nodeIdSetting && nodeIdSetting.NodeIds.Intersect(ancestorsOrSelfIds).Any())?.Mode 
                               ?? PreviewMode.UseHeadlessPreview;

            return new ApiResponse<PreviewModeResponse>
            {
                Data = new PreviewModeResponse { PreviewMode = previewMode },
                IsSuccess = true
            };
        }

        [HttpPost]
        public IActionResult SaveConfiguration(PreviewConfiguration configuration)
        {
            try
            {
                _previewConfigurationService.Save(configuration);
            }
            catch (Exception exception)
            {
                return BadRequest(
                    new Response
                    {
                        StatusCode = HttpStatusCode.BadRequest,
                        Success = false,
                        Message = exception.Message,
                        Exception = exception
                    });
            }

            return Ok(
                new Response
                {
                    StatusCode = HttpStatusCode.OK,
                    Success = true
                });
        }
    }
}