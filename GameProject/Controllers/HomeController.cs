using Microsoft.AspNetCore.Mvc;

namespace GameProject.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IHttpContextAccessor _contextAccessor;

        public HomeController(ILogger<HomeController> logger, IHttpContextAccessor contextAccessor)
        {
            _logger = logger;
            _contextAccessor = contextAccessor;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Signup()
        {
            if (_contextAccessor.HttpContext.Request.Cookies[".AspNetCore.Cookies"] != null)
            {
                return RedirectToAction("Index", "Game");
            }
            
            return View();
        }

        public IActionResult Login()
        {
            if (_contextAccessor.HttpContext.Request.Cookies[".AspNetCore.Cookies"] != null)
            {
                return RedirectToAction("Index", "Game");
            }

            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }
    }
}