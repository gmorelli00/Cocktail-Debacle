using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;

namespace backend.Controllers;

[ApiController]
[Route("api/places")]
public class PlaceSearchController : ControllerBase
{
    private readonly HttpClient _httpClient;

    public PlaceSearchController(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchPlaces([FromQuery] string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return BadRequest("Query is required.");

        // Estendi la query con cocktail e drink
        var enrichedQuery = $"{query} cocktail drink";

        var apiKey = Environment.GetEnvironmentVariable("GOOGLE_MAPS_API_KEY");
        if (string.IsNullOrEmpty(apiKey))
            return StatusCode(500, "API key not configured on server.");

        var url = $"https://maps.googleapis.com/maps/api/place/textsearch/json" +
                  $"?query={Uri.EscapeDataString(enrichedQuery)}&key={apiKey}";

        try
        {
            var response = await _httpClient.GetStringAsync(url);
            return Content(response, "application/json");
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(500, $"Google API request failed: {ex.Message}");
        }
    }

    [HttpGet("details")] 
    public async Task<IActionResult> GetPlaceDetails([FromQuery] string placeId) 
    { 
        if (string.IsNullOrWhiteSpace(placeId))
            return BadRequest("placeId is required.");

        var apiKey = Environment.GetEnvironmentVariable("GOOGLE_MAPS_API_KEY");
        if (string.IsNullOrEmpty(apiKey))
            return StatusCode(500, "API key not configured on server.");
        
        var url = $"https://maps.googleapis.com/maps/api/place/details/json" +
                  $"?place_id={Uri.EscapeDataString(placeId)}&key={apiKey}";
        
        try
        {
            var response = await _httpClient.GetStringAsync(url);
            return Content(response, "application/json");
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(500, $"Google API request failed: {ex.Message}");
        }

    }

    [HttpGet("nearby")]
    public async Task<IActionResult> SearchNearbyPlaces([FromQuery] double? lat = null, [FromQuery] double? lng = null, [FromQuery] int radius = 1500)
    {
        var apiKey = Environment.GetEnvironmentVariable("GOOGLE_MAPS_API_KEY");
        if (string.IsNullOrEmpty(apiKey))
            return StatusCode(500, "API key not configured on server.");
    
        // Default to Rome coordinates if not provided (example for Italian locations)
        double latitude = lat ?? 41.9028;
        double longitude = lng ?? 12.4964;
    
        // La query 'cocktail drink' aiuta a filtrare i risultati
        var keyword = Uri.EscapeDataString("cocktail drink");
    
        var url = $"https://maps.googleapis.com/maps/api/place/nearbysearch/json" +
                  $"?location={latitude},{longitude}" +
                  $"&radius={radius}" +
                  $"&keyword={keyword}" +
                  $"&key={apiKey}";
    
        try
        {
            var response = await _httpClient.GetStringAsync(url);
            return Content(response, "application/json");
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(500, $"Google API request failed: {ex.Message}");
        }
    }


    [HttpGet("photo")]
    public async Task<IActionResult> GetPlacePhoto([FromQuery] string photoReference, [FromQuery] int? maxWidth = 400)
    {
        if (string.IsNullOrWhiteSpace(photoReference))
            return BadRequest("Photo reference is required.");

        var apiKey = Environment.GetEnvironmentVariable("GOOGLE_MAPS_API_KEY");
        if (string.IsNullOrEmpty(apiKey))
            return StatusCode(500, "API key not configured on server.");

        var url = $"https://maps.googleapis.com/maps/api/place/photo" +
                  $"?maxwidth={maxWidth}" +
                  $"&photo_reference={Uri.EscapeDataString(photoReference)}" +
                  $"&key={apiKey}";

        try
        {
            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, "Failed to fetch photo");

            var imageBytes = await response.Content.ReadAsByteArrayAsync();
            var contentType = response.Content.Headers.ContentType?.MediaType ?? "image/jpeg";

            return File(imageBytes, contentType);
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(500, $"Google API request failed: {ex.Message}");
        }
    }
}
