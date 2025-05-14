using System.Text.Json;
using backend.Data;
using backend.Entities;

namespace backend.Services;

public class CocktailImportService
{
    private readonly AppDbContext _context;

    public CocktailImportService(AppDbContext context)
    {
        _context = context;
    }

    public async Task ImportCocktailsFromJson(string filePath)
    {
        var json = await File.ReadAllTextAsync(filePath);
        var jsonDoc = JsonDocument.Parse(json);
        var drinks = jsonDoc.RootElement.GetProperty("drinks");

        var cocktails = JsonSerializer.Deserialize<List<Cocktails>>(drinks.GetRawText());

        if (cocktails != null)
        {
            _context.Cocktails.AddRange(cocktails);
            await _context.SaveChangesAsync();
        }
    }
}
