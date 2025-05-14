using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Entities;
using backend.DTOs; // Importa il namespace per CocktailDto
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FavoritesController : ControllerBase
{
    private readonly AppDbContext _context;

    public FavoritesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: /api/favorites/username
    [HttpGet("{username}")]
    public async Task<IActionResult> GetUserFavorites(string username)
    {
        User? user = null;

        user = await _context.Users
            .Include(u => u.Favorites)
            .ThenInclude(uf => uf.Cocktail)
            .FirstOrDefaultAsync(u => u.UserName == username);

        if (user == null)
            return NotFound(new { message = $"User '{username}' not found." });

        var favorites = user.Favorites
            .Select(uf => new CocktailDto
            {
                IdDrink = uf.Cocktail != null ? uf.Cocktail.IdDrink : "",
                StrDrink = uf.Cocktail != null ? uf.Cocktail.StrDrink : "",
                StrDrinkThumb = uf.Cocktail != null ? uf.Cocktail.StrDrinkThumb : "",
                Popularity = uf.Cocktail != null ? uf.Cocktail.FavoritedBy.Count : 0,
                ReviewsCount = uf.Cocktail != null ? uf.Cocktail.Reviews.Count : 0
            })
            .ToList();

        return Ok(favorites);
    }


    // POST: /api/favorites/15346
    [Authorize]
    [HttpPost("{idDrink}")]
    public async Task<IActionResult> AddFavorite(string idDrink)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
            return Unauthorized();

        var user = await _context.Users
            .Include(u => u.Favorites)
            .FirstOrDefaultAsync(u => u.Id.ToString() == userId);

        if (user == null)
            return NotFound(new { message = "Utente non trovato." });

        var cocktail = await _context.Cocktails.FindAsync(idDrink);
        if (cocktail == null)
            return NotFound();

        if (!user.Favorites.Any(uf => uf.CocktailId == idDrink))
        {
            var userFavorite = new UserFavorite
            {
                UserId = user.Id,
                CocktailId = idDrink
            };
            _context.UserFavorites.Add(userFavorite);
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Cocktail aggiunto ai preferiti." });
    }



    // DELETE: /api/favorites/15346
    [HttpDelete("{idDrink}")]
    [Authorize]
    public async Task<IActionResult> RemoveFavorite(string idDrink)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
            return Unauthorized();

        var user = await _context.Users
            .Include(u => u.Favorites)
            .FirstOrDefaultAsync(u => u.Id.ToString() == userId);

        var cocktail = await _context.Cocktails.FindAsync(idDrink);
        if (cocktail == null)
            return NotFound();

        if (user == null)
            return NotFound(new { message = "Utente non trovato." });
        var userFavorite = user.Favorites.FirstOrDefault(uf => uf.CocktailId == idDrink);

        if (userFavorite != null)
        {
            _context.UserFavorites.Remove(userFavorite);
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Cocktail rimosso dai preferiti." });
    }
}
