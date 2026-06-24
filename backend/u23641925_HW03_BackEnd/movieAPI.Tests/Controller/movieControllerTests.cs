using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using movieAPI.Controllers;
using movieAPI.Models;
using movieAPI.Repositories;
using movieAPI.Services;

namespace movieAPI.Tests.Controller
{
    public class MovieControllerTests
    {
        //create fake logged in user
        private static ControllerContext GetFakeContext(int userId)
        {
            var claims = new List<Claim>
            {
                //imulates the user ID inside authentication - defines and represents user 
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            };

            var identity = new ClaimsIdentity(claims, "TestAuth");
            var principal = new ClaimsPrincipal(identity);

            return new ControllerContext
            {
                //attach
                HttpContext = new DefaultHttpContext
                {
                    User = principal
                }
            };
        }

        //get watch list return 200 ok 
        [Fact]
        public async Task GetWatchlist_ReturnsOk_WhenUserHasMovies()
        {
            //create fake repo
            var mockRepo = new Mock<IMovieRepository>();
            OMDbService service = null!;

            //tells moq to return 1 movie list
            mockRepo.Setup(r => r.GetWatchListByUser(It.IsAny<int>()))
                .ReturnsAsync(new List<WatchList>
                {
                    new WatchList { Id = 1, MovieId = "tt123", UserId = 1 }
                });

            //builds controller and injects user
            var controller = new ListController(service, mockRepo.Object);
            controller.ControllerContext = GetFakeContext(1);

            var result = await controller.GetWatchlist();

            Assert.IsType<OkObjectResult>(result);
        }

        //get watch list not found 404 message
        [Fact]
        public async Task GetWatchlist_ReturnsNotFound_WhenEmpty()
        {
            var mockRepo = new Mock<IMovieRepository>();
            OMDbService service = null!;

            //user has no movies return null
            mockRepo.Setup(r => r.GetWatchListByUser(It.IsAny<int>()))
                .ReturnsAsync(new List<WatchList>());

            var controller = new ListController(service, mockRepo.Object);
            controller.ControllerContext = GetFakeContext(1);

            var result = await controller.GetWatchlist();

            Assert.IsType<NotFoundResult>(result);
        }


        //reset return 200 ok
        [Fact]
        public async Task ResetTimesWatched_ReturnsOk_WhenMovieExists()
        {
            var mockRepo = new Mock<IMovieRepository>();
            OMDbService service = null!;

            //when movie exists reset set to true
            mockRepo.Setup(r => r.ResetWatchedTimes(It.IsAny<int>()))
                .ReturnsAsync(true);

            var controller = new ListController(service, mockRepo.Object);
            controller.ControllerContext = GetFakeContext(1);

            var result = await controller.ResetTimesWatched(1);          

            Assert.IsType<OkObjectResult>(result);
        }

        //reset return 404 not found
        [Fact]
        public async Task ResetTimesWatched_ReturnsNotFound_WhenMovieDoesNotExist()
        {
            var mockRepo = new Mock<IMovieRepository>();
            OMDbService service = null!;

            //when movie does not exist reset set to false
            mockRepo.Setup(r => r.ResetWatchedTimes(It.IsAny<int>()))
                .ReturnsAsync(false);

            var controller = new ListController(service, mockRepo.Object);
            controller.ControllerContext = GetFakeContext(1);

            var result = await controller.ResetTimesWatched(999);

            Assert.IsType<NotFoundResult>(result);
        }
    }
}