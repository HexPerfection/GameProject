using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace GameProject.Models
{
    public class User : IdentityUser
    {
        [MaxLength(36)]
        public override string Id { get; set; }
        public ICollection<HighScore> HighScores { get; set; }
        public List<User> Friends { get; set; }

    }
}
