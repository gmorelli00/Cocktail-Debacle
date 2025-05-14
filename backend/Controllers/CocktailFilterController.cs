using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Controllers;

[ApiController]
[Route("api/cocktails")]
public class CocktailFilterController : ControllerBase
{
    private readonly AppDbContext _context;

    public CocktailFilterController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/cocktails/categories
    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        var raw = await _context.Cocktails
            .AsNoTracking()
            .Where(c => !string.IsNullOrWhiteSpace(c.StrCategory))
            .Select(c => c.StrCategory!.Trim().ToLowerInvariant())
            .ToListAsync();

        var categories = raw
            .Distinct()
            .OrderBy(c => c)
            .Select(c => char.ToUpper(c[0]) + c.Substring(1))
            .ToList();

        return Ok(categories);
    }

    // GET: api/cocktails/ingredients
    [HttpGet("ingredients")]
    public async Task<ActionResult<IEnumerable<string>>> GetIngredients()
    {
        var ingredientLists = await _context.Cocktails
            .AsNoTracking()
            .Select(c => new[]
            {
                c.StrIngredient1, c.StrIngredient2, c.StrIngredient3, c.StrIngredient4, c.StrIngredient5,
                c.StrIngredient6, c.StrIngredient7, c.StrIngredient8, c.StrIngredient9, c.StrIngredient10,
                c.StrIngredient11, c.StrIngredient12, c.StrIngredient13, c.StrIngredient14, c.StrIngredient15
            })
            .ToListAsync();

        var ingredients = ingredientLists
            .SelectMany(i => i)
            .Where(i => !string.IsNullOrWhiteSpace(i))
            .Select(i => i!.Trim().ToLowerInvariant())
            .Distinct()
            .OrderBy(i => i)
            .Select(i => char.ToUpper(i[0]) + i.Substring(1))
            .ToList();

        return Ok(ingredients);
    }

    // GET: api/cocktails/glasses
    [HttpGet("glasses")]
    public async Task<ActionResult<IEnumerable<string>>> GetGlasses()
    {
        var raw = await _context.Cocktails
            .AsNoTracking()
            .Where(c => !string.IsNullOrWhiteSpace(c.StrGlass))
            .Select(c => c.StrGlass!.Trim().ToLowerInvariant())
            .ToListAsync();

        var glasses = raw
            .Distinct()
            .OrderBy(g => g)
            .Select(g => char.ToUpper(g[0]) + g.Substring(1))
            .ToList();

        return Ok(glasses);
    }
}
