namespace Our.Umbraco.HeadlessPreview.Models
{
    // [CHANGE: Umbraco 17 upgrade - response for the preview-mode endpoint that gates the headless option]
    // Related: PreviewApiController.cs, Client/src/condition.ts
    public class PreviewModeResult
    {
        /// <summary>
        /// True when the headless preview option should be shown for the requested document.
        /// </summary>
        public bool Applies { get; set; }

        /// <summary>
        /// The resolved preview mode for the document (informational).
        /// </summary>
        public string Mode { get; set; } = string.Empty;
    }
}
