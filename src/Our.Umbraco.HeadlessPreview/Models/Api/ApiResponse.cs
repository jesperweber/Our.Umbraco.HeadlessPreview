namespace Our.Umbraco.HeadlessPreview.Models.Api
{
    public class ApiResponse<T> : ApiResponse
    {
        public T Data { get; set; }
    }

    public class ApiResponse
    {
        public bool IsSuccess { get; set; }
    }
}