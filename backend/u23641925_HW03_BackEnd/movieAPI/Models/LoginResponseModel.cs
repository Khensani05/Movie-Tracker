namespace movieAPI.Models
{
    public class LoginResponseModel
    {
        //not converted bcs it is data from bckend it is already stored
        public int User_ID { get; set; }
        public string? User_Email { get; set; }
        public string? accessToken { get; set; }
        public DateTime expiresIn { get; set; } // in secs
    }
}
