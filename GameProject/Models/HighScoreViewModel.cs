using System.ComponentModel.DataAnnotations;

namespace GameProject.Models
{
    public class HighScoreViewModel
    {
        [Required]
        public HighScore userHighScore { get; set; }

    }
}
