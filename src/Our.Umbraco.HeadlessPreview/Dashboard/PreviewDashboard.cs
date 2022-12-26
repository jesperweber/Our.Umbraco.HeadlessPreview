using System;
using System.IO;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Dashboards;

namespace Our.Umbraco.HeadlessPreview.Dashboard
{
    [Weight(30)]
    public class PreviewSettingsDashboard : IDashboard
    {
        public string Alias => "previewSettingsDashboard";
        public string View => Path.Combine("/", "App_Plugins", "Our.Umbraco.HeadlessPreview", "views", "configuration.html");
        public string[] Sections => new[] { "Settings" };

        public IAccessRule[] AccessRules => Array.Empty<IAccessRule>();
    }
}