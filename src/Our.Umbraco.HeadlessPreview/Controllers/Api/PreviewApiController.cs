using System;
using System.Net;
using Microsoft.AspNetCore.Mvc;
using Our.Umbraco.HeadlessPreview.Models;
using Our.Umbraco.HeadlessPreview.Models.Api;
using Our.Umbraco.HeadlessPreview.Services;
using Umbraco.Cms.Web.BackOffice.Controllers;
using Umbraco.Cms.Web.BackOffice.Filters;

namespace Our.Umbraco.HeadlessPreview.Controllers.Api
{
    [JsonCamelCaseFormatter]
    public class PreviewApiController : UmbracoAuthorizedApiController
    {
        private readonly IPreviewConfigurationService _previewConfigurationService;
        
        public PreviewApiController(IPreviewConfigurationService previewConfigurationService)
        {
            _previewConfigurationService = previewConfigurationService;
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