using GameProject.Data;
using GameProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GameProject.Controllers
{
    [Authorize(AuthenticationSchemes = "Cookies")]
    public class GameController : Controller
    {
        private readonly DatabaseContext _context;
        private readonly UserManager<User> _userManager;

        public GameController(Data.DatabaseContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public IActionResult Index()
        {        
            return View();
        }

        public IActionResult Pong()
        {
            return View();
        }

        public IActionResult Maze()
        {
            return View();
        }

        [Authorize]
        public async Task<IActionResult> Test()
        {
            var viewModel = new HighScoreViewModel();

            var username = User.Identity.Name;

            var user = _context.Users.Include(u => u.HighScores).FirstOrDefault(u => u.UserName == username);
   
            var highScore = user.HighScores.FirstOrDefault(hs => hs.GameId == 1);

            // If the user has no previous high score for this game, create a new one
            if (highScore == null)
            {
                highScore = new HighScore { GameId = 1, Score = 0, Date = DateTime.Now};
                user.HighScores.Add(highScore);
            }

            // If the user's current high score is less than 100, increment the score by 10 and update the database
            if (highScore.Score < 100)
            {
                highScore.Score += 10;
                _context.SaveChanges();
            }

            viewModel.userHighScore = highScore;
            
            // Render the TestGame view with the user's high score for the test game
            return View("Test", viewModel);
        }

        [Authorize]
        [HttpPost]
        public IActionResult UpdateHighScore(int gameId, int score)
        {       
            if (ModelState.IsValid)
            {
                var user = _context.Users.Include(u => u.HighScores).FirstOrDefault(u => u.UserName == User.Identity.Name);

                var highScore = user.HighScores.FirstOrDefault(u => u.GameId == gameId);

                if (score > highScore.Score)
                {
                    highScore.Score = score;
                    _context.SaveChanges();

                } else
                {
                    System.Diagnostics.Debug.WriteLine("Score is lower than highscore, nothing changed.");
                }

                return RedirectToAction("Index", "Game");
            }

            return RedirectToAction("Index", "Game");
        }

        public async Task<IActionResult> HighScores()
        {
            var highScores = await _context.HighScores.ToListAsync();
            return View(highScores);
        }
    }
}
