using GameProject.Models;
using Microsoft.EntityFrameworkCore;

namespace GameProject.Data
{
    public class DatabaseContext : DbContext
    {
        public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<HighScore> HighScores { get; set; }
        public DbSet<FriendRequest> FriendRequests { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<Game>().ToTable("games");
            modelBuilder.Entity<HighScore>().ToTable("highscores");
            modelBuilder.Entity<FriendRequest>().ToTable("friendrequests");
        }
    }
}
