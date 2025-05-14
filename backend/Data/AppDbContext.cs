using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using backend.Entities;

namespace backend.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<User, Role, int>(options)
{
    public DbSet<Place> Places { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Cocktails> Cocktails { get; set; }
    public DbSet<CocktailReviewMetadata> CocktailReviewMetadatas { get; set; }
    public DbSet<UserFavorite> UserFavorites { get; set; } // 👈 Aggiunto

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<CocktailReviewMetadata>()
            .HasKey(m => new { m.PlaceId, m.CocktailId });

        modelBuilder.Entity<Review>()
            .HasOne(r => r.User)
            .WithMany(u => u.Reviews)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Place)
            .WithMany(p => p.Reviews)
            .HasForeignKey(r => r.PlaceId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Cocktail)
            .WithMany(c => c.Reviews)
            .HasForeignKey(r => r.CocktailId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CocktailReviewMetadata>()
            .HasOne(m => m.Place)
            .WithMany()
            .HasForeignKey(m => m.PlaceId);

        modelBuilder.Entity<CocktailReviewMetadata>()
            .HasOne(m => m.Cocktail)
            .WithMany()
            .HasForeignKey(m => m.CocktailId);

        // 👇 Aggiungi questa parte
        modelBuilder.Entity<UserFavorite>()
            .HasOne(f => f.User)
            .WithMany(u => u.Favorites)
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserFavorite>()
            .HasOne(f => f.Cocktail)
            .WithMany(c => c.FavoritedBy)
            .HasForeignKey(f => f.CocktailId)
            .OnDelete(DeleteBehavior.Cascade);

        
        modelBuilder.Entity<Cocktails>()
            .HasOne(c => c.CreatedBy)
            .WithMany(u => u.CreatedCocktails)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
