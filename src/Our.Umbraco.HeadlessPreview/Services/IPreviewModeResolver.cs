using Our.Umbraco.HeadlessPreview.Models;
using Umbraco.Cms.Core.Models;

namespace Our.Umbraco.HeadlessPreview.Services
{
    // [CHANGE: Umbraco 17 upgrade - shared preview-mode resolution used by the url provider and the
    //  management API endpoint that gates the headless preview option] Related: HeadlessPreviewUrlProvider.cs, PreviewApiController.cs
    public interface IPreviewModeResolver
    {
        /// <summary>
        /// Resolves the configured <see cref="PreviewMode"/> for the given content node.
        /// </summary>
        PreviewMode Resolve(IContent content);

        /// <summary>
        /// True when the headless preview is configured, not disabled, and the resolved mode for the
        /// content node is <see cref="PreviewMode.UseHeadlessPreview"/>.
        /// </summary>
        bool HeadlessPreviewApplies(IContent content);
    }
}
