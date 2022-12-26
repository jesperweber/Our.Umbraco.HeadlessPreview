using Microsoft.AspNetCore.Builder;

namespace Our.Umbraco.HeadlessPreview.Extensions
{
    public static class ApplicationBuilderExtension
    {
        public static IApplicationBuilder UseHeadlessPreview(this IApplicationBuilder app)
        {
            return app.UseMiddleware<HeadlessPreview>();
        }
    }
}