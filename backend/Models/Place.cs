namespace backend.Entities;

public class Place
{
    public int Id { get; set; }
    public string GooglePlaceId { get; set; } = null!;
    public string? Name { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
