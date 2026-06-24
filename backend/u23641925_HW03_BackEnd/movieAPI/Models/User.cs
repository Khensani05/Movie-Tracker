using System.ComponentModel.DataAnnotations;

namespace movieAPI.Models
{
    public class User
    {
        [Key]
        public int User_ID { get; set; }
        public string User_Email { get; set; }
        public string User_Password_Hash { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
