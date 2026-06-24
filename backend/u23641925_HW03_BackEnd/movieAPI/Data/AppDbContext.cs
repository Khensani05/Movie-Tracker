using Microsoft.EntityFrameworkCore;
using movieAPI.Models;

namespace movieAPI.Data
{
    public class AppDbContext : DbContext
    {

        //cofigure the DBCONTEXT
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Movie> Movies { get; set; }
        public DbSet<WatchedList> WatchedLists { get; set; }
        public DbSet<WatchList> WatchLists { get; set; }
    }
}
