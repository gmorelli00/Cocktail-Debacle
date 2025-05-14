using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Entities;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using backend.DTOs;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using backend.Extensions;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CocktailsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public CocktailsController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // GET: /api/cocktails
    [HttpGet]

    public async Task<ActionResult<IEnumerable<CocktailDto>>> GetAllCocktails()
    {
        var cocktails = await _context.Cocktails
            .AsNoTracking()                    // lettura‑only → performance
            .Select(c => new CocktailDto
            {
                IdDrink        = c.IdDrink,
                StrDrink       = c.StrDrink,
                StrCategory    = c.StrCategory,
                StrAlcoholic   = c.StrAlcoholic,
                StrGlass       = c.StrGlass,
                StrInstructions = c.StrInstructions,
                StrDrinkThumb  = c.StrDrinkThumb,
    
                // INGREDIENTI (copiati 1‑1: puoi automatizzare con AutoMapper se preferisci)
                StrIngredient1  = c.StrIngredient1,
                StrIngredient2  = c.StrIngredient2,
                StrIngredient3  = c.StrIngredient3,
                StrIngredient4  = c.StrIngredient4,
                StrIngredient5  = c.StrIngredient5,
                StrIngredient6  = c.StrIngredient6,
                StrIngredient7  = c.StrIngredient7,
                StrIngredient8  = c.StrIngredient8,
                StrIngredient9  = c.StrIngredient9,
                StrIngredient10 = c.StrIngredient10,
                StrIngredient11 = c.StrIngredient11,
                StrIngredient12 = c.StrIngredient12,
                StrIngredient13 = c.StrIngredient13,
                StrIngredient14 = c.StrIngredient14,
                StrIngredient15 = c.StrIngredient15,
    
                // MISURE
                StrMeasure1  = c.StrMeasure1,
                StrMeasure2  = c.StrMeasure2,
                StrMeasure3  = c.StrMeasure3,
                StrMeasure4  = c.StrMeasure4,
                StrMeasure5  = c.StrMeasure5,
                StrMeasure6  = c.StrMeasure6,
                StrMeasure7  = c.StrMeasure7,
                StrMeasure8  = c.StrMeasure8,
                StrMeasure9  = c.StrMeasure9,
                StrMeasure10 = c.StrMeasure10,
                StrMeasure11 = c.StrMeasure11,
                StrMeasure12 = c.StrMeasure12,
                StrMeasure13 = c.StrMeasure13,
                StrMeasure14 = c.StrMeasure14,
                StrMeasure15 = c.StrMeasure15,
    
                UserId       = c.UserId ?? 0,          // se è nullable
                Popularity   = c.FavoritedBy.Count(),  // COUNT(*) via SQL, niente lazy‑load
                ReviewsCount = c.Reviews.Count()
            })
            .ToListAsync();
    
        return Ok(cocktails);
    }


    // GET: /api/cocktails/15346
    [HttpGet("{id}")]
    public async Task<ActionResult<CocktailDto>> GetCocktailById(string id)
    {
        var cocktail = await _context.Cocktails
            .Include(c => c.CreatedBy)
            .Include(c => c.Reviews)
            .Include(c => c.FavoritedBy)
            .FirstOrDefaultAsync(c => c.IdDrink == id);

        if (cocktail == null)
            return NotFound();

        var dto = new CocktailDto
        {
            IdDrink = cocktail.IdDrink,
            StrDrink = cocktail.StrDrink,
            StrCategory = cocktail.StrCategory,
            StrAlcoholic = cocktail.StrAlcoholic,
            StrGlass = cocktail.StrGlass,
            StrInstructions = cocktail.StrInstructions,
            StrDrinkThumb = cocktail.StrDrinkThumb,

            StrIngredient1 = cocktail.StrIngredient1,
            StrIngredient2 = cocktail.StrIngredient2,
            StrIngredient3 = cocktail.StrIngredient3,
            StrIngredient4 = cocktail.StrIngredient4,
            StrIngredient5 = cocktail.StrIngredient5,
            StrIngredient6 = cocktail.StrIngredient6,
            StrIngredient7 = cocktail.StrIngredient7,
            StrIngredient8 = cocktail.StrIngredient8,
            StrIngredient9 = cocktail.StrIngredient9,
            StrIngredient10 = cocktail.StrIngredient10,
            StrIngredient11 = cocktail.StrIngredient11,
            StrIngredient12 = cocktail.StrIngredient12,
            StrIngredient13 = cocktail.StrIngredient13,
            StrIngredient14 = cocktail.StrIngredient14,
            StrIngredient15 = cocktail.StrIngredient15,

            StrMeasure1 = cocktail.StrMeasure1,
            StrMeasure2 = cocktail.StrMeasure2,
            StrMeasure3 = cocktail.StrMeasure3,
            StrMeasure4 = cocktail.StrMeasure4,
            StrMeasure5 = cocktail.StrMeasure5,
            StrMeasure6 = cocktail.StrMeasure6,
            StrMeasure7 = cocktail.StrMeasure7,
            StrMeasure8 = cocktail.StrMeasure8,
            StrMeasure9 = cocktail.StrMeasure9,
            StrMeasure10 = cocktail.StrMeasure10,
            StrMeasure11 = cocktail.StrMeasure11,
            StrMeasure12 = cocktail.StrMeasure12,
            StrMeasure13 = cocktail.StrMeasure13,
            StrMeasure14 = cocktail.StrMeasure14,
            StrMeasure15 = cocktail.StrMeasure15,

            UserId = cocktail.UserId ?? 0,
            UserName = cocktail.CreatedBy?.UserName ?? string.Empty,
            Popularity = cocktail.FavoritedBy.Count,
            ReviewsCount = cocktail.Reviews.Count
        };

        return Ok(dto);
    }

    // GET: /api/cocktails/popular
    [HttpGet("popular")]
    public async Task<IActionResult> GetPopularCocktails()
    {
        var cocktails = await _context.Cocktails
            .Select(c => c.ToDto())  // Usa il metodo di estensione
            .ToListAsync();

        return Ok(cocktails);
    }


    // POST: /api/cocktails/upload-image
    [Authorize]
    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Nessun file ricevuto.");

        var permittedMimeTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!permittedMimeTypes.Contains(file.ContentType))
            return BadRequest("Formato immagine non supportato.");


        var uploadsFolder = Path.Combine(_env.WebRootPath!, "uploads");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
        return Ok(new { url = fileUrl });
    }

    // POST: /api/cocktails/create
    [Authorize]
    [HttpPost("create")]
    public async Task<IActionResult> CreateCocktail([FromBody] CocktailDto dto)
    {
        var claimValue = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(claimValue))
            return Unauthorized("Claim utente mancante.");

        if (!int.TryParse(claimValue, out var userId))
            return Unauthorized("Claim utente non valido.");

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound("Utente non trovato.");

        var cocktail = dto.ToEntity(user);

        _context.Cocktails.Add(cocktail);
        await _context.SaveChangesAsync();

        return Ok(cocktail);
    }
}
