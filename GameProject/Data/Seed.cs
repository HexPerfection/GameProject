using GameProject.Data;
using GameProject.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;

namespace GameProject.Data
{
    public static class Seed
    {
        public static void Initialize(DatabaseContext context)
        {
            if (!context.Users.Any())
            {
                var user1 = new User
                {
                    UserName = "dbtestuser1",
                    PasswordHash = "password1",
                    Friends = new List<User>(),
                    HighScores = new List<HighScore>()
                };

                context.Users.AddRange(user1);
                context.SaveChanges();
            }

            if (!context.Games.Any())
            {
                context.Games.AddRange(
                    new Game
                    {
                        Name = "Maze"
                    },
                    new Game
                    {
                        Name = "Pong"
                    }
                );
                context.SaveChanges();
            }

            if (!context.HighScores.Any())
            {
                int[] gameIds = context.Games.Select(g => g.Id).ToArray();

                Random random = new Random();

                for (int i = 1; i < 3; i++)
                {
                    HighScore highScore = new HighScore
                    {
                        Score = random.Next(10, 101),
                        Date = DateTime.Now.AddDays(-i),
                        UserId = context.Users.First().Id,
                        GameId = i
                    };

                    context.HighScores.Add(highScore);
                }

                context.SaveChanges();
            }
        }
    }
}
