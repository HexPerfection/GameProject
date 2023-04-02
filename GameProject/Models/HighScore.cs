using System.ComponentModel.DataAnnotations;

namespace GameProject.Models
{
    public class HighScore
    {
        public int Id { get; set; }

        [Required]
        public int Score { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public string UserId { get; set; }
        public User User { get; set; }

        [Required]
        public int GameId { get; set; }
        public Game Game { get; set; }
    }
}
