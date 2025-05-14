using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Entities;

namespace backend.Controllers;

[ApiController]
[Route("api/user/reviews")]
public class UserReviewController(AppDbContext db, UserManager<User> userManager) : ControllerBase
{
    private readonly AppDbContext _db = db;
    private readonly UserManager<User> _userManager = userManager;

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetUserReviews()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        var reviews = await _db.Reviews
            .Where(r => r.UserId == user.Id)
            .Include(r => r.Cocktail)
            .Include(r => r.Place)
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

    [HttpGet("{userIdOrUsername}")]
    public async Task<IActionResult> GetUserReviewsByIdOrUsername(string userIdOrUsername)
    {
        User? user;

        // Cerca prima per ID numerico, poi per username
        if (int.TryParse(userIdOrUsername, out var id))
        {
            user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        }
        else
        {
            user = await _db.Users.FirstOrDefaultAsync(u => u.UserName == userIdOrUsername);
        }

        if (user == null)
            return NotFound("User not found");

        var reviews = await _db.Reviews
            .Where(r => r.UserId == user.Id)
            .Include(r => r.Cocktail)
            .Include(r => r.Place)
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
