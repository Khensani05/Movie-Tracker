using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using movieAPI.Models;
using movieAPI.Repositories;
using movieAPI.Services;
using System.Threading.Channels;

namespace movieAPI.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMovieRepository _repository;
        private readonly JWTService _service;

        public AuthController(IMovieRepository repository, JWTService service)
        {
            _repository = repository;
            _service = service;
        }

        //paot - registered users : POST /api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> registerUser(LoginRequestModel loginRequest)
        {
            var newRegisteredUser = new User
            {
                User_Email = loginRequest.User_Email,
                User_Password_Hash = BCrypt.Net.BCrypt.HashPassword(loginRequest.Password_Hash),
                CreatedAt = DateTime.UtcNow
            };

            var created = await _repository.RegisteredUser(newRegisteredUser);
            return Ok(new {created.User_ID, created.User_Email, created.CreatedAt});
        }

        //post - logged in users (thosewho are registered) - POST /api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> loginUser(LoginRequestModel loginRequest)
        {   
            //try to find user by email first
            var foundUser = await _repository.LoginUser(loginRequest.User_Email);

            if (foundUser == null)
                return Unauthorized();


            //vrify hash password agianst svaed hash in databse
            var checkPassword = BCrypt.Net.BCrypt.Verify(loginRequest.Password_Hash, foundUser.User_Password_Hash);
            if (!checkPassword)
                return Unauthorized();

            var accessToken = _service.GenerateAccessToken(foundUser);

            return Ok(new LoginResponseModel
            {
                User_ID = foundUser.User_ID,
                User_Email = foundUser.User_Email,
                accessToken = accessToken,
                expiresIn = DateTime.UtcNow.AddDays(7)
            });
        }
    }
}
