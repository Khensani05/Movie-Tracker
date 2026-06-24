using System.Text.Json.Serialization;

namespace movieAPI.Models
{
    public class LoginRequestModel
    {
        //data sent to c# must be converted
        [JsonPropertyName("user_Email")] public string? User_Email { get; set; }
        [JsonPropertyName("password_Hash")] public string? Password_Hash { get; set; }
    }
}
