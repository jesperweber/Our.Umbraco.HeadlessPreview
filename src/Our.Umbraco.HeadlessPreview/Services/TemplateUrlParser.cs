using System;
using System.Collections.Generic;
using Our.Umbraco.HeadlessPreview.Models;

namespace Our.Umbraco.HeadlessPreview.Services
{
    public class TemplateUrlParser : ITemplateUrlParser
    {
        public string Parse(string templateUrl, string hostname, string slug)
        {
            return templateUrl
                .Replace($"{{{TemplateUrlPlaceHolder.Hostname}}}", hostname, StringComparison.InvariantCultureIgnoreCase)
                .Replace($"{{{TemplateUrlPlaceHolder.Slug}}}", slug, StringComparison.InvariantCultureIgnoreCase);
        }

        public TemplateUrlPlaceHolder[] GetPlaceHolders(string templateUrl)
        {
            var placeHolders = new List<TemplateUrlPlaceHolder>();
            foreach (TemplateUrlPlaceHolder placeHolder in Enum.GetValues(typeof(TemplateUrlPlaceHolder)))
            {
                if(templateUrl.Contains($"{{{placeHolder}}}", StringComparison.InvariantCultureIgnoreCase))
                    placeHolders.Add(placeHolder);
            }

            return placeHolders.ToArray();
        }
    }
}