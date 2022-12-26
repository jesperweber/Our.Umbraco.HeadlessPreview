using System;
using System.Net;

namespace Our.Umbraco.HeadlessPreview.Models.Api
{
    public class Response
    {
        public bool Success { get; set; }
        public HttpStatusCode StatusCode { get; set; }
        public string Message { get; set; }
        public Exception Exception { get; set; }
    }
}