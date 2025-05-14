using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/reviews/place/{placeIdOrGoogle}/cocktail/{cocktailIdOrExternal}")]
public class ReviewPlaceCocktailController(AppDbContext db) : ControllerBase
{
    private readonly AppDbContext _db = db;

    [HttpGet]
    public async Task<IActionResult> GetReviewsForCocktailAtPlace(string placeIdOrGoogle, string cocktailIdOrExternal)
    {
        // Trova il Place (id interno o GooglePlaceId)
        var place = int.TryParse(placeIdOrGoogle, out var placeId)
            ? await _db.Places.FirstOrDefaultAsync(p => p.Id == placeId)
            : await _db.Places.FirstOrDefaultAsync(p => p.GooglePlaceId == placeIdOrGoogle);

        if (place == null)
            return NotFound("Place not found.");

        // Trova il Cocktail (id interno o external)
        var cocktail = await _db.Cocktails.FirstOrDefaultAsync(c => c.IdDrink == cocktailIdOrExternal);

        if (cocktail == null)
            return NotFound("Cocktail not found.");

        // Recupera le recensioni
        var reviews = await _db.Reviews
            .Where(r => r.PlaceId == place.Id && r.CocktailId == cocktail.IdDrink)
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                r.UserId,
                r.User.UserName,
                r.PlaceId,
                r.Place.GooglePlaceId,
                r.Place.Name,
                r.CocktailId,
                r.Cocktail.StrDrink,
            })
            .ToListAsync();

        return Ok(reviews);
    }
}
