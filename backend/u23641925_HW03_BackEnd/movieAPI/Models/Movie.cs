using movieAPI.Models;
using System.Text.Json.Serialization;

namespace movieAPI.Models
{
    public class Movie
    {
        //because api is using json we have to convert to C# to be usable by the api
        public int Id { get; set; }
        [JsonPropertyName("Title")] public string? Title { get; set; }
        [JsonPropertyName("Year")] public string? Year { get; set; }
        [JsonPropertyName("Rated")] public string? Rated { get; set; }
        [JsonPropertyName("Runtime")] public string? Runtime { get; set; }
        [JsonPropertyName("Genre")] public string? Genre { get; set; }
        [JsonPropertyName("Actors")] public string? Actors { get; set; }
        [JsonPropertyName("Plot")] public string? Plot { get; set; }
        [JsonPropertyName("Poster")] public string? Poster { get; set; }
        [JsonPropertyName("imdbVotes")] public string? ImdbVotes { get; set; }
        [JsonPropertyName("imdbID")] public string? ImdbID { get; set; } //used to fetch full movie in OMDb
        [JsonPropertyName("Type")] public string? Type { get; set; }


        //search response - the OMDB 
        public class OMDbSearchResult
        {
            //convert json to c#

            //how we want the api to return movie objects
            [JsonPropertyName("Search")] public List<Movie> Search { get; set; } = new();
            [JsonPropertyName("totalResults")] public string? TotalResults { get; set; }
            [JsonPropertyName("Response")] public string? Response { get; set; }
        }
    }
}
