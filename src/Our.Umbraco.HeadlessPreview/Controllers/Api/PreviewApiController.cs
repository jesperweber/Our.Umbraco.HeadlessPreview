using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Our.Umbraco.HeadlessPreview.Models;
using Our.Umbraco.HeadlessPreview.Models.Api;
using Our.Umbraco.HeadlessPreview.Services;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;

namespace Our.Umbraco.HeadlessPreview.Controllers.Api;
[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = "Our.Umbraco.HeadlessPreview")]
#if NET8_0
public class PreviewApiController(
    IPreviewConfigurationService previewConfigurationService,
    IUmbracoContextFactory umbracoContextFactory)
    : ApiControllerBase
{
#endif
#if NET9_0_OR_GREATER
    public class PreviewApiController(
    IPreviewConfigurationService previewConfigurationService,
    IUmbracoContextFactory umbracoContextFactory,
    IPublishedContentTypeCache publishedContentTypeCache,
    IPublishedContentCache publishedContentCache)
    : ApiControllerBase
{
#endif
    private class ConfigurationApiResponse : ApiResponse<PreviewConfiguration>;

    [HttpGet("GetConfiguration")]
    [ProducesResponseType(typeof(ConfigurationApiResponse), StatusCodes.Status200OK)]
    public ApiResponse<PreviewConfiguration> GetConfiguration()
    {
        var config = previewConfigurationService.GetConfiguration();
        return new ApiResponse<PreviewConfiguration>
        {
            Data = config,
            IsSuccess = true
        };
    }

    private class PreviewModeApiResponse : ApiResponse<PreviewModeResponse>;

    [HttpGet("GetPreviewMode")]
    [ProducesResponseType(typeof(PreviewModeApiResponse), StatusCodes.Status200OK)]
    public ApiResponse<PreviewModeResponse> GetPreviewMode(Guid nodeGuid, Guid contentTypeGuid)
    {
        var config = previewConfigurationService.GetConfiguration();

        if (config.Disabled)
        {
            return new ApiResponse<PreviewModeResponse>
            {
                Data = new PreviewModeResponse { PreviewMode = PreviewMode.UseStandardPreview },
                IsSuccess = true
            };
        }

        using var umbracoContext = umbracoContextFactory.EnsureUmbracoContext().UmbracoContext;
        var node = umbracoContext.Content.GetById(true, nodeGuid);
        if (node is null)
        {
            return new ApiResponse<PreviewModeResponse>
            {
                Data = new PreviewModeResponse { PreviewMode = PreviewMode.UseHeadlessPreview },
                IsSuccess = true
            };
        }

        var ancestorsOrSelfIds = new List<int>();
        if (config.PreviewModeSettings.Any(x => x is PreviewModeSettingNodeId { IncludeDescendants: true }))
        {
            ancestorsOrSelfIds.AddRange(node.AncestorsOrSelf().Select(x => x.Id));
        }

#if NET8_0
        var contentType = umbracoContext.Content.GetContentType(contentTypeGuid);
#endif
#if NET9_0_OR_GREATER
        var contentType = publishedContentTypeCache.Get(PublishedItemType.Content, contentTypeGuid);
#endif

        var previewMode = config.PreviewModeSettings.FirstOrDefault(x
                               => x is PreviewModeSettingContentType contentTypeSetting && contentTypeSetting.ContentTypes.Contains(contentType.Alias)
                                || x is PreviewModeSettingNodeId nodeIdSetting && nodeIdSetting.NodeIds.Intersect(ancestorsOrSelfIds).Any())?.Mode
                           ?? PreviewMode.UseHeadlessPreview;

        return new ApiResponse<PreviewModeResponse>
        {
            Data = new PreviewModeResponse { PreviewMode = previewMode },
            IsSuccess = true
        };
    }

    [HttpPost("SaveConfiguration")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public ApiResponse SaveConfiguration(PreviewConfiguration configuration)
    {
        try
        {
            previewConfigurationService.Save(configuration);
        }
        catch (Exception exception)
        {
            return new ApiResponse
            {
                IsSuccess = false
            };
        }

        return new ApiResponse
        {
            IsSuccess = true
        };
    }
}
