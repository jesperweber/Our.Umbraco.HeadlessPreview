using System;
using System.Collections.Generic;
using System.Linq;
using Umbraco.Cms.Core.Models;

namespace Our.Umbraco.HeadlessPreview.Extensions
{
    // [CHANGE: Umbraco 17 upgrade - shared path helper] Related: HeadlessPreviewUrlProvider.cs, PreviewModeResolver.cs
    public static class ContentExtensions
    {
        /// <summary>
        /// The node id followed by its ancestor ids (nearest first), derived from
        /// <see cref="IContentBase.Path"/> ("-1,1050,1234").
        /// </summary>
        public static IEnumerable<int> AncestorOrSelfIds(this IContent content)
            => content.Path
                .Split(',', StringSplitOptions.RemoveEmptyEntries)
                .Select(x => int.TryParse(x, out var id) ? id : 0)
                .Where(id => id > 0)
                .Reverse();
    }
}
