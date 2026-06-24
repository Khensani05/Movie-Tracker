using System.Formats.Asn1;

namespace movieAPI.Services
{
    public class OMDbService
    {
        private readonly HttpClient _http;
        private readonly IConfiguration _configuration;

        public OMDbService(HttpClient http, IConfiguration configuration)
        {
            _http = http;
            _configuration = configuration;
        }

        //search by title
        public async Task<string> SearchMovies(string title)
        {
            var apiKey = _configuration["OMDb:ApiKey"];
            var baseUrl = _configuration["OMDb:BaseUrl"];


            var url = $"{baseUrl}?apikey={apiKey}&s={title}";

            return await _http.GetStringAsync(url);
        }

        //get movie by its imbd id
        public async Task<string> GetMovieById(string id)
        {
            var apiKey = _configuration["OMDb:ApiKey"];
            var baseUrl = _configuration["OMDb:BaseUrl"];
            var url = $"{baseUrl}?i={id}&apikey={apiKey}";

            return await _http.GetStringAsync(url);
        }
    }
}
