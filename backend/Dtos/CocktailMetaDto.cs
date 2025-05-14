using System.Text.Json.Serialization;

namespace backend.DTOs.CocktailMeta;

public class CocktailMetaDto
{
    public int PlaceId { get; set; }
    public string GooglePlaceId { get; set; } = string.Empty;

    public double AverageScore { get; set; }
    public int ReviewCount { get; set; }

    [JsonIgnore]
    public double? Latitude { get; set; }
    [JsonIgnore]
    public double? Longitude { get; set; }
}
