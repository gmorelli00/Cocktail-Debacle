namespace backend.Services;

using backend.DTOs.CocktailMeta;

public interface ISortingService 
{
    Task<IEnumerable<CocktailMetaDto>> SortByDistanceAsync(IEnumerable<CocktailMetaDto> places, double userLat, double userLng); 
    
}