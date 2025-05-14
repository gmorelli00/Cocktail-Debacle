namespace backend.DTOs.Review;

public class ReviewCreateDto
{
    public double Rating { get; set; }
    public string Comment { get; set; } = null!;
    public string? CocktailId { get; set; }

    public string GooglePlaceId { get; set; } = null!;
    public string? PlaceName { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}
