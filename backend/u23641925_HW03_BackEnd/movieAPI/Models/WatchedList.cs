using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace movieAPI.Models
{
    public class WatchedList
    {
        //frontend already sends object as it is - no sensitive data stored about object hence no DTO 
        public int Id { get; set; }
        public string? MovieId { get; set; }
        public int UserId { get; set; }
        public int TimesWatched { get; set; } = 1;
    }
}
