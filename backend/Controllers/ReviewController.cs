using backend.Data;
using backend.DTOs.Review;
using backend.DTOs.CocktailMeta;
using backend.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewController(AppDbContext db, UserManager<User> userManager) : ControllerBase
{
    private readonly AppDbContext _db = db;
    private readonly UserManager<User> _userManager = userManager;

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> AddReview([FromBody] ReviewCreateDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        // Trova o crea il Place
        var place = await _db.Places.FirstOrDefaultAsync(p => p.GooglePlaceId == dto.GooglePlaceId);
        if (place == null)
        {
            place = new Place 
            { 
                GooglePlaceId = dto.GooglePlaceId,
                Name = dto.PlaceName,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude
            };
            _db.Places.Add(place);
            await _db.SaveChangesAsync();
        }

        Cocktails? cocktail = null;

        // Trova o crea il Cocktail
        if (!string.IsNullOrWhiteSpace(dto.CocktailId))
            cocktail = await _db.Cocktails.FirstOrDefaultAsync(c => c.IdDrink == dto.CocktailId);
        
        if (cocktail == null)
        {
            return BadRequest("Cocktail is required and was not found or created.");
        }

        // Crea la recensione
        var review = new Review
        {
            Rating = dto.Rating,
            Comment = dto.Comment,
            UserId = user.Id,
            PlaceId = place.Id,
            CocktailId = cocktail.IdDrink,
            CreatedAt = DateTime.UtcNow
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        // Trova o crea il metadata
        var metadata = await _db.CocktailReviewMetadatas
            .FirstOrDefaultAsync(m => m.PlaceId == place.Id && m.CocktailId == cocktail.IdDrink);
        
        if (metadata == null)
        {
            metadata = new CocktailReviewMetadata
            {
                PlaceId = place.Id,
                CocktailId = cocktail.IdDrink,
                ReviewCount = 1,
                AverageScore = dto.Rating
            };
            _db.CocktailReviewMetadatas.Add(metadata);
        }
        else
        {
            // Calcola nuova media: (media corrente * num_recensioni + nuovo voto) / (num_recensioni + 1)
            metadata.AverageScore = (metadata.AverageScore * metadata.ReviewCount + dto.Rating) / (metadata.ReviewCount + 1);
            metadata.ReviewCount += 1;
        }
        
        await _db.SaveChangesAsync();

        return Ok(new { message = "Review added successfully." });
    }

    [Authorize]
    [HttpGet("{reviewId}")]
    public async Task<IActionResult> GetReview(int reviewId)
    {
        var review = await _db.Reviews
            .Include(r => r.Cocktail)
            .Include(r => r.Place)
            .FirstOrDefaultAsync(r => r.Id == reviewId);
    
        if (review == null)
            return NotFound("Review not found");
    
        return Ok(new
        {
            review.Id,
            review.Rating,
            review.Comment,
            review.CreatedAt,
            Cocktail = new { review.Cocktail.IdDrink, review.Cocktail.StrDrink },
            Place = new { review.Place.Id, review.Place.GooglePlaceId },
            review.UserId
        });
    }
    
    [Authorize]
    [HttpPatch("{reviewId}")]
    public async Task<IActionResult> UpdateReview(int reviewId, [FromBody] ReviewUpdateDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == reviewId);
    
        if (review == null)
            return NotFound("Review not found");
    
        if (review.UserId != user?.Id)
            return Forbid();
    
        if (dto.Rating.HasValue)
            review.Rating = dto.Rating.Value;
    
        if (!string.IsNullOrWhiteSpace(dto.Comment))
            review.Comment = dto.Comment;
    
        await _db.SaveChangesAsync();
    
        return Ok(new { message = "Review updated successfully." });
    }
    
    [Authorize]
    [HttpDelete("{reviewId}")]
    public async Task<IActionResult> DeleteReview(int reviewId)
    {
        var user = await _userManager.GetUserAsync(User);
        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == reviewId);
    
        if (review == null)
            return NotFound("Review not found");
    
        if (review.UserId != user?.Id)
            return Forbid();
    
        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync();
    
        return Ok(new { message = "Review deleted successfully." });
    }

}
