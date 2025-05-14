using Microsoft.AspNetCore.Identity;
using System.Text.Json.Serialization;

namespace backend.Entities;

public class User : IdentityUser<int>
{
    public bool ConsentData { get; set; }
    public bool ConsentSuggestions { get; set; }
    // Campi aggiuntivi (custom)
    public string? Provider { get; set; }
    public string? ProviderId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<UserFavorite> Favorites { get; set; } = new List<UserFavorite>();
    [JsonIgnore]
    public ICollection<Cocktails> CreatedCocktails { get; set; } = new List<Cocktails>();

}