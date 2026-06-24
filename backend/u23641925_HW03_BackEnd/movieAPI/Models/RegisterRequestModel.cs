using System.Text.Json.Serialization;

namespace movieAPI.Models
{
    public class RegisterRequestModel
    {
        //data coming in as json must be deserialised so it is usable
        [JsonPropertyName("user_Email")] public string? User_Email { get; set; }
        [JsonPropertyName("password_Hash")] public string? Password_Hash { get; set; }
    }
}
