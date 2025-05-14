using backend.DTOs.CocktailMeta; using backend.Entities; using backend.Data; using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class SortingService : ISortingService 
{ 
    private readonly AppDbContext _db;

    public SortingService(AppDbContext db)
    {
        _db = db;
    }
    
    public async Task<IEnumerable<CocktailMetaDto>> SortByDistanceAsync(IEnumerable<CocktailMetaDto> places, double userLat, double userLng)
    {
        // Prende tutti i GooglePlaceId unici dalla lista
        var googlePlaceIds = places.Select(p => p.GooglePlaceId).Distinct().ToList();
    
        // Prende le info di lat/lng dal DB
        var placesFromDb = await _db.Places
            .Where(p => googlePlaceIds.Contains(p.GooglePlaceId))
            .ToDictionaryAsync(p => p.GooglePlaceId);
    
        // Arricchisce i DTO con latitudine/longitudine
        foreach (var p in places)
        {
            if (placesFromDb.TryGetValue(p.GooglePlaceId, out var placeEntity))
            {
                p.Latitude = placeEntity.Latitude;
                p.Longitude = placeEntity.Longitude;
            }
        }
    
        // Ordina per distanza
        var sorted = places
            .Where(p => p.Latitude != null && p.Longitude != null)
            .OrderBy(p => GetDistance(userLat, userLng, p.Latitude!.Value, p.Longitude!.Value))
            .ToList();
    
        return sorted;
    }
    
    private double GetDistance(double lat1, double lng1, double lat2, double lng2)
    {
        // Formula Haversine
        double R = 6371e3; // metri
        double φ1 = lat1 * Math.PI / 180;
        double φ2 = lat2 * Math.PI / 180;
        double Δφ = (lat2 - lat1) * Math.PI / 180;
        double Δλ = (lng2 - lng1) * Math.PI / 180;
    
        double a = Math.Sin(Δφ / 2) * Math.Sin(Δφ / 2) +
                   Math.Cos(φ1) * Math.Cos(φ2) *
                   Math.Sin(Δλ / 2) * Math.Sin(Δλ / 2);
        double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    
        double d = R * c;
        return d;
    }

}