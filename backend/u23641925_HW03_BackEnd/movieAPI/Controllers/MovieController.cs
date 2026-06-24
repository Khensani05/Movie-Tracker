using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using movieAPI.Data;
using movieAPI.Models;
using movieAPI.Repositories;
using movieAPI.Services;

namespace movieAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MovieController : ControllerBase
    {
        private readonly OMDbService _service;

        public MovieController(OMDbService service)
        {
            _service = service;
        }

        //get movies by title - use SearchMovies in service
        [HttpGet("search")]
        public async Task<IActionResult> Search(string title)
        {
            var result = await _service.SearchMovies(title);
            return Ok(result);
        }

        //get movies by id - use getmoviebyid in service
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var result = await _service.GetMovieById(id);
            return Ok(result);
        }
    }
}
