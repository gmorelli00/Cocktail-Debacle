using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Entities;

public class UserFavorite
{
    [Key]
    public int Id { get; set; }

    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    public string CocktailId { get; set; } = string.Empty;

    [ForeignKey(nameof(CocktailId))]
    public Cocktails Cocktail { get; set; } = null!;
}
