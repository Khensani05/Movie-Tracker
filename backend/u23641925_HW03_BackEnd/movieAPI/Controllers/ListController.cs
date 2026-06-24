using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using movieAPI.Data;
using movieAPI.Models;
using movieAPI.Repositories;
using movieAPI.Services;
using System.Security.Claims;

namespace movieAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/list")]
    public class ListController : ControllerBase
    {
        private readonly IMovieRepository _repository;
        private readonly OMDbService _service;

        public ListController(OMDbService service, IMovieRepository repository)
        {
            _service = service;
            _repository = repository;
        }

        // Helper: pull userId from JWT so users can't query each other's lists
        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);


        //-----------------------------------WATCH LIST ---------------------------------------------------//

        //1. get list by user : GET /api/watchlist
        [HttpGet("watchlist")]
        public async Task<IActionResult> GetWatchlist()
        {
            var watchlist = await _repository.GetWatchListByUser(GetUserId());

            return Ok(watchlist);
        }

        //2. add to watch list : POST /api/watchlist
        [HttpPost("watchlist")]
        public async Task<IActionResult> AddToWatchlist(WatchList watchlist)
        {
            watchlist.UserId = GetUserId();  //enforce owner

            var addedMovie = await _repository.AddToWatch(watchlist);

            if (addedMovie == null)
            {
                return BadRequest("Movie already exists in watchlist");
            }

            return Ok(addedMovie);
        }

        //3. delete watch list movie : DELETE /api/watchlist/{id}
        [HttpDelete("watch/{id}")]
        public async Task<IActionResult> DeleteWatch(int id)
        {
            return await _repository.DeleteWatch(id) ? NoContent() : NotFound();
        }


        //-----------------------------------WATCHED LIST ---------------------------------------------------//


        //1. get by user : GET /api/watched
        [HttpGet("watchedlist")]
        public async Task<IActionResult> GetWatchedlist()
        {
            var watchedlist = await _repository.GetWatchedByUser(GetUserId());

            return Ok(watchedlist);
        }

        //2. add to watched : POST /api/watched
        [HttpPost("watched")]
        public async Task<IActionResult> AddToWatchedlist(WatchedList watchedlist)
        {
            watchedlist.UserId = GetUserId();

            var addedMovie = await _repository.AddToWatched(watchedlist);

            if (addedMovie == null)
            {
                return BadRequest("Movie already exists in watched list");
            }

            return Ok(addedMovie);
        }

        //3. Reset times watched : POST /api/watched/reset/{id}
        [HttpPost("reset/{id}")]
        public async Task<IActionResult> ResetTimesWatched(int id)
        {
            var reset = await _repository.ResetWatchedTimes(id);

            return reset ? Ok("Times watched reset") : NotFound();
        }

        //3.increment times watced : PUT /api/watched/{id}
        [HttpPut("watched/{id}")]
        public async Task<IActionResult> IncrementTimesWatched(int id)
        {
            var movie = await _repository.IncrementTimesWatched(id);

            return movie ? Ok() : NotFound();
        }

        [HttpPut("watchedremove/{id}")]
        public async Task<IActionResult> DecrementTimesWatched(int id)
        {
            var movie = await _repository.DecrementTimesWatched(id);

            return movie ? Ok() : NotFound();
        }

        //4. delete from watched : DELETE /api/watched/{id}
        [HttpDelete("watched/{id}")]
        public async Task<IActionResult> DeleteWatched(int id)
        {
            return await _repository.DeleteWatched(id) ? NoContent() : NotFound();
        }
    }
}
