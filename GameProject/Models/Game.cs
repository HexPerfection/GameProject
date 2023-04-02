using System.ComponentModel.DataAnnotations;

namespace GameProject.Models
{
    public class Game
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public ICollection<HighScore> HighScores { get; set; }
    }
}
