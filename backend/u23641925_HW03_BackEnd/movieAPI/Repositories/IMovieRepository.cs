using movieAPI.Models;
using System.Collections;
using Microsoft.EntityFrameworkCore;

namespace movieAPI.Repositories
{
    public interface IMovieRepository
    {
        //users - interface methods
        Task<User> RegisteredUser(User user);
        Task<User> LoginUser(string email);

        //watch list interface method
        Task<List<WatchList>> GetWatchListByUser(int userId);
        Task<WatchList?> GetWatchById(int Id);
        Task<WatchList?> AddToWatch(WatchList watchList);
        Task<bool> DeleteWatch(int Id);

        //watched list interface method
        Task<List<WatchedList>> GetWatchedByUser(int userId);
        Task<WatchedList?> GetWatchedById(int Id);
        Task<bool> ResetWatchedTimes(int id);
        Task<bool> IncrementTimesWatched(int id);
        Task<bool> DecrementTimesWatched(int id);
        Task<WatchedList?> AddToWatched(WatchedList watchedList);
        Task<bool> DeleteWatched(int Id);
    }
}
