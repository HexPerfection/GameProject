using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GameProject.Data;
using GameProject.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;

namespace GameProject.Controllers
{
    [Authorize(AuthenticationSchemes = "Cookies")]
    public class FriendRequestController : Controller
    {
        private readonly DatabaseContext _context;
        private readonly UserManager<User> _userManager;

        public FriendRequestController(Data.DatabaseContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: FriendRequest
        public async Task<IActionResult> Index()
        {
            var userID = _userManager.Users.FirstOrDefault(u => u.UserName == User.Identity.Name).Id;
        
            var friendRequests = await _context.FriendRequests
                .Where(r => r.ReceiverId == userID && r.Status == FriendRequestStatus.Pending)
                .ToListAsync();

            return View(friendRequests);
        }

        // GET: FriendRequest/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: FriendRequest/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(FriendRequestViewModel friendRequestViewModel)
        {
            if (ModelState.IsValid)
            {
                var sender = _context.Users.Include(u => u.Friends).FirstOrDefault(u => u.UserName == User.Identity.Name);
                var receiver = _context.Users.Include(u => u.Friends).FirstOrDefault(u => u.UserName == friendRequestViewModel.ReceiverUsername);

                if (receiver == null)
                {
                    TempData["error"] = "No user with this username was found!";
                    return RedirectToAction("Create");
                }

                if (receiver.Id == sender.Id) 
                {
                    TempData["error"] = "Cannot send a friend request to yourself!";
                    return RedirectToAction("Create");
                }

                if (sender.Friends.Where(fr => fr.UserName == friendRequestViewModel.ReceiverUsername).Any())
                {
                    TempData["error"] = "The request to this user was already sent!";
                    return RedirectToAction("Create");
                }

                FriendRequest friendRequest = new FriendRequest
                {
                    SenderId = sender.Id,
                    ReceiverId = receiver.Id,
                    Status = FriendRequestStatus.Pending
                };

                // Add FriendRequest to DbSet and save changes
                _context.FriendRequests.Add(friendRequest);
                await _context.SaveChangesAsync();

                // Redirect to Index action to display list of pending friend requests
                return RedirectToAction("Index", "Account");

            }

            TempData["error"] = "The username field is required!";
            return RedirectToAction("Create");
        }

        // GET: FriendRequest/Accept/5
        public async Task<IActionResult> Accept(int id)
        {
            var friendRequest = await _context.FriendRequests.FindAsync(id);

            var user = _context.Users
                        .Include(u => u.Friends)
                        .FirstOrDefault(u => u.UserName == User.Identity.Name);

            if (friendRequest == null)
            {
                TempData["error"] = "No friend request with the given id!";
                return RedirectToAction("Index");
            }

            if (user.Id != friendRequest.ReceiverId)
            {
                TempData["error"] = "Cannot modify this friend request";
                return RedirectToAction("Index");
            }

            friendRequest.Status = FriendRequestStatus.Accepted;

            var friend = _context.Users.Include(u => u.Friends).FirstOrDefault(u => u.Id == friendRequest.SenderId);
            
            user.Friends.Add(friend);
            friend.Friends.Add(user);

            await _userManager.UpdateAsync(user);
            _context.Update(friendRequest);

            await _context.SaveChangesAsync();  

            return RedirectToAction("Index");
        }

        // GET: FriendRequest/Decline/5
        public async Task<IActionResult> Decline(int id)
        {
            var friendRequest = await _context.FriendRequests.FindAsync(id);
            var user = _context.Users.FirstOrDefault(u => u.UserName == User.Identity.Name);

            if (friendRequest == null)
            {
                TempData["error"] = "No friend request with the given id!";
                return RedirectToAction("Index");
            }

            if (user.Id != friendRequest.ReceiverId)
            {
                TempData["error"] = "Cannot modify this friend request";
                return RedirectToAction("Index");
            }

            friendRequest.Status = FriendRequestStatus.Declined;

            _context.Update(friendRequest);
            await _context.SaveChangesAsync();

            return RedirectToAction("Index");
        }
    }
}