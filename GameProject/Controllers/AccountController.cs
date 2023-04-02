using System.Security.Claims;
using GameProject.Data;
using GameProject.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GameProject.Controllers
{
    public class AccountController : Controller
    {
        private readonly DatabaseContext _context;
        private readonly UserManager<User> _userManager;

        public AccountController(Data.DatabaseContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [Authorize(AuthenticationSchemes = "Cookies")]
        public IActionResult Index()
        {
            var user = _context.Users.Include(u => u.Friends).ThenInclude(fr => fr.HighScores).ThenInclude(hs => hs.Game).Include(u => u.HighScores).ThenInclude(hs => hs.Game).FirstOrDefault(u => u.UserName == User.Identity.Name);        
            return View(user);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Signup(SignupViewModel signup)
        {

            if (ModelState.IsValid)
            {
                if (_context.Users.Any(u => u.UserName == signup.Username))
                {
                    TempData["error"] = "Username is already in use!";
                    return RedirectToAction("Signup", "Home");
                }

                if (signup.Password != signup.ConfirmPassword)
                {
                    TempData["error"] = "Passwords don't match!";
                    return RedirectToAction("Signup", "Home");
                }

                List<HighScore> initHighScores = new List<HighScore>
                {
                    new HighScore { GameId = 1, Score = 0 },
                    new HighScore { GameId = 2, Score = 0 }
                };

                var user = new User { UserName = signup.Username, PasswordHash = signup.Password, Friends = new List<User>(), HighScores = initHighScores};
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return RedirectToAction("Login", "Home");
            }
            
            TempData["error"] = "Not all fields were filled. Try again!";
            return RedirectToAction("Signup", "Home");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginViewModel login)
        {                 
            if (ModelState.IsValid)
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == login.Username && u.PasswordHash == login.Password);

                if (user != null)
                {
                    await Authenticate(user);

                    return RedirectToAction("Index", "Game");
                }

                TempData["error"] = "Invalid username or password!";
                return RedirectToAction("Login", "Home");
            }

            TempData["error"] = "Not all fields were filled. Try again!";
            return RedirectToAction("Login", "Home");
        }

        private async Task Authenticate(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimsIdentity.DefaultNameClaimType, user.UserName),
            };

            var claimsIdentity = new ClaimsIdentity(claims, "CookieAuthentication", ClaimsIdentity.DefaultNameClaimType, ClaimsIdentity.DefaultRoleClaimType);
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity));
        }

        [HttpPost]
        public async Task<IActionResult> Logout()
        {     
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Index", "Home");
        }
    }
}