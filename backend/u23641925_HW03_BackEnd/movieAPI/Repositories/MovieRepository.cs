using Microsoft.EntityFrameworkCore;
using movieAPI.Data;
using movieAPI.Models;

namespace movieAPI.Repositories
{
    //implementation class
    public class MovieRepository : IMovieRepository
    {
        private readonly AppDbContext _context;

        public MovieRepository(AppDbContext context)
        {
            _context = context;
        }

        //post registered users
        public async Task<User> RegisteredUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        //post login users
        public async Task<User?> LoginUser(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.User_Email == email);
        }

        //WATCHLIST

        //1. get watch list by user
        public async Task<List<WatchList>> GetWatchListByUser(int userId)
        {
            return await _context.WatchLists
                .Where(w => w.UserId == userId)
                .ToListAsync();
        }

        //2. get watch list by id
        public async Task<WatchList?> GetWatchById(int id)
        {
            return await _context.WatchLists
                .FirstOrDefaultAsync(w => w.Id == id);
        }


        //3. add to watch list
        public async Task<WatchList?> AddToWatch(WatchList watchlist)
        {
            var exstingMovie = await _context.WatchLists.AnyAsync(w =>
                w.MovieId == watchlist.MovieId &&
                w.UserId == watchlist.UserId);

            if (exstingMovie)
            {
                return null;
            }

            _context.WatchLists.Add(watchlist);
            await _context.SaveChangesAsync();
            return watchlist;
        }

        //4. delete watch list
        public async Task<bool> DeleteWatch(int id)
        {
            var watchList = await _context.WatchLists.FindAsync(id);

            if (watchList == null) return false;

            _context.WatchLists.Remove(watchList);
            await _context.SaveChangesAsync();
            return true;
        }

        //WATHEDLIST

        //1. get watched list by user
        public async Task<List<WatchedList>> GetWatchedByUser(int userId)
        {
            return await _context.WatchedLists
                .Where(w => w.UserId == userId)
                .ToListAsync();
        }

        //2. get watched by id
        public async Task<WatchedList?> GetWatchedById(int id)
        {
            return await _context.WatchedLists
                .FirstOrDefaultAsync(w => w.Id == id);
        }

        //3. reset times watched
        public async Task<bool> ResetWatchedTimes(int id)
        {
            var watchedMovie = await _context.WatchedLists.FindAsync(id);

            if (watchedMovie == null)
            {
                return false;
            }

            watchedMovie.TimesWatched = 1;

            await _context.SaveChangesAsync();

            return true;
        }

        //4. increment times watched
        public async Task<bool> IncrementTimesWatched(int id)
        {
            var watchedMovie = await _context.WatchedLists.FindAsync(id);

            if (watchedMovie == null)
            {
                return false;
            }

            watchedMovie.TimesWatched++;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DecrementTimesWatched(int id)
        {
            var watchedMovie = await _context.WatchedLists.FindAsync(id);

            if (watchedMovie == null)
            {
                return false;
            }

            if (watchedMovie.TimesWatched > 1)
            {
                watchedMovie.TimesWatched--;
            }

            await _context.SaveChangesAsync();

            return true;
        }

        //4. add to watched list
        public async Task<WatchedList?> AddToWatched(WatchedList watchedlist)
        {
            var exstingMovie = await _context.WatchedLists.AnyAsync(w =>
                w.MovieId == watchedlist.MovieId &&
                w.UserId == watchedlist.UserId);

            if (exstingMovie)
            {
                return null;
            }

            _context.WatchedLists.Add(watchedlist);
            await _context.SaveChangesAsync();
            return watchedlist;
        }

        //5. delete watched list
        public async Task<bool> DeleteWatched(int id)
        {
            var watchedList = await _context.WatchedLists.FindAsync(id);

            if (watchedList == null) return false;

            _context.WatchedLists.Remove(watchedList);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
