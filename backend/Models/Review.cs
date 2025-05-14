namespace backend.Entities;

public class Review
{
    public int Id { get; set; }
    public double Rating { get; set; } // Es: 1-5 stelle
    public string Comment { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Relazioni
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string? CocktailId { get; set; }
    public Cocktails Cocktail { get; set; } = null!;

    public int PlaceId { get; set; }
    public Place Place { get; set; } = null!;
}
