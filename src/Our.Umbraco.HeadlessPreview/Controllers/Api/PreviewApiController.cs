using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Our.Umbraco.HeadlessPreview.Models;
using Our.Umbraco.HeadlessPreview.Services;
using Umbraco.Cms.Api.Management.Controllers;
using Umbraco.Cms.Api.Management.Routing;
using Umbraco.Cms.Core.Services;

namespace Our.Umbraco.HeadlessPreview.Controllers.Api
{
    // [CHANGE: Umbraco 17 upgrade - migrated from UmbracoAuthorizedApiController (removed Umbraco.Cms.Web.BackOffice)
    //  to a Management API controller backing the new Lit settings dashboard + the preview-option visibility condition]
    // Related: HeadlessPreviewUrlProvider.cs, PreviewModeResolver.cs, Client/src/dashboard.element.ts, Client/src/condition.ts
    [VersionedApiBackOfficeRoute("headless-preview")]
    [ApiExplorerSettings(GroupName = "Headless Preview")]
    public class PreviewApiController : ManagementApiControllerBase
    {
        private readonly IPreviewConfigurationService _previewConfigurationService;
        private readonly IPreviewModeResolver _previewModeResolver;
        private readonly IContentService _contentService;

        public PreviewApiController(
            IPreviewConfigurationService previewConfigurationService,
            IPreviewModeResolver previewModeResolver,
            IContentService contentService)
        {
            _previewConfigurationService = previewConfigurationService;
            _previewModeResolver = previewModeResolver;
            _contentService = contentService;
        }

        [HttpGet("configuration")]
        [ProducesResponseType(typeof(PreviewConfiguration), StatusCodes.Status200OK)]
        public IActionResult GetConfiguration()
        {
            return Ok(_previewConfigurationService.GetConfiguration());
        }

        [HttpPost("configuration")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult SaveConfiguration([FromBody] PreviewConfiguration configuration)
        {
            try
            {
                _previewConfigurationService.Save(configuration);
            }
            catch (Exception exception)
            {
                return BadRequest(exception.Message);
            }

            return Ok();
        }

        // Used by the client-side condition to decide whether the "Headless preview" option should be
        // shown for the document currently open in the workspace.
        [HttpGet("preview-mode")]
        [ProducesResponseType(typeof(PreviewModeResult), StatusCodes.Status200OK)]
        public IActionResult GetPreviewMode(Guid key)
        {
            var content = _contentService.GetById(key);
            if (content is null)
            {
                // Unknown / not-yet-saved document: default to showing the option.
                return Ok(new PreviewModeResult { Applies = true, Mode = PreviewMode.UseHeadlessPreview.ToString() });
            }

            return Ok(new PreviewModeResult
            {
                Applies = _previewModeResolver.HeadlessPreviewApplies(content),
                Mode = _previewModeResolver.Resolve(content).ToString(),
            });
        }
    }
}
