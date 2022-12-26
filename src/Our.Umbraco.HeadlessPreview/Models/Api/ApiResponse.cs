namespace Our.Umbraco.HeadlessPreview.Models.Api
{
    public class ApiResponse<T>
    {
        public bool IsSuccess { get; set; }
        public T Data { get; set; }
    }
}