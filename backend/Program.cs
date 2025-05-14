using backend.Data;
using backend.Entities;
using backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Text.Json;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost",  // Nome della policy CORS
        policy =>
        {
            policy.WithOrigins("http://localhost")  // L'indirizzo del tuo frontend Angular
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();  // Aggiungi questa riga per permettere l'invio di credenziali (cookie)
        });
});


// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddHttpClient(); // Per HttpClient injection


var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddIdentity<User, Role>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "JwtBearer";
    options.DefaultChallengeScheme = "JwtBearer";
})
.AddJwtBearer("JwtBearer", options =>
{
    var jwtConfig = builder.Configuration.GetSection("Jwt");
    var key = jwtConfig["Key"] ?? throw new InvalidOperationException("Jwt:Key non configurato correttamente.");
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtConfig["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtConfig["Audience"],
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // Se l'Authorization header non esiste, prova a leggere dal cookie "jwt"
            if (context.Request.Cookies.ContainsKey("jwt"))
            {
                context.Token = context.Request.Cookies["jwt"];
            }
            return Task.CompletedTask;
        }
    };
})
.AddGoogle(options =>
{
    var googleConfig = builder.Configuration.GetSection("Authentication:Google");
    options.ClientId = googleConfig["ClientId"] ?? throw new InvalidOperationException("Authentication:Google:ClientId mancante.");
    options.ClientSecret = googleConfig["ClientSecret"] ?? throw new InvalidOperationException("Authentication:Google:ClientSecret mancante.");
    options.CallbackPath = "/auth/google-response"; // Dove Google ti riporta dopo il login
});


builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<UserNameService>();
builder.Services.AddScoped<ISortingService, SortingService>();
builder.Services.AddScoped<RecommendationService>();



var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // db.Database.EnsureDeleted();
    db.Database.Migrate();

    // ✅ IMPORT AUTOMATICO cocktail
    var env = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();
    var filePath = Path.Combine(env.WebRootPath ?? "wwwroot", "data", "cocktails.json");
    
    if (File.Exists(filePath))
    {
        try
        {
            var json = await File.ReadAllTextAsync(filePath);
            var jsonDoc = JsonDocument.Parse(json);
            var drinks = jsonDoc.RootElement.GetProperty("drinks");

            var cocktails = JsonSerializer.Deserialize<List<Cocktails>>(drinks.GetRawText());
            if (cocktails != null && !db.Cocktails.Any())
            {
                db.Cocktails.AddRange(cocktails);
                await db.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Errore durante l'importazione dei cocktail: {ex.Message}");
        }
    }
    else
    {
        Console.WriteLine("Il file cocktails.json non è stato trovato.");
    }

    // ✅ Import degli utenti
    var usersFilePath = Path.Combine(env.WebRootPath ?? "wwwroot", "data", "users.json");
    if (File.Exists(usersFilePath))
    {
        try
        {
            var json = await File.ReadAllTextAsync(usersFilePath);
            var users = JsonSerializer.Deserialize<List<User>>(json);

            if (users != null)
            {
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

                foreach (var user in users)
                {
                    if (user.Email != null && await userManager.FindByEmailAsync(user.Email) == null)
                    {
                        // Imposta manualmente una password o prendila dal JSON
                        var result = await userManager.CreateAsync(user, "PasswordForte123!");
                        if (!result.Succeeded)
                        {
                            Console.WriteLine($"Errore creazione utente {user.Email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Errore durante l'importazione degli utenti: {ex.Message}");
        }
    }
    else
    {
        Console.WriteLine("Il file users.json non è stato trovato.");
    }

    // ✅ IMPORT PLACES (mock)
    var placesFilePath = Path.Combine(env.WebRootPath ?? "wwwroot", "data", "places.json");

    if (File.Exists(placesFilePath))
    {
        try
        {
            var json = await File.ReadAllTextAsync(placesFilePath);
            var places = JsonSerializer.Deserialize<List<Place>>(json);

            if (places != null && !db.Places.Any())
            {
                db.Places.AddRange(places);
                await db.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Errore durante l'importazione dei places: {ex.Message}");
        }
    }
    else
    {
        Console.WriteLine("Il file places.json non è stato trovato.");
    }

    // ✅ IMPORT REVIEWS (mock)
    var reviewsFilePath = Path.Combine(env.WebRootPath ?? "wwwroot", "data", "reviews.json");
    
    if (File.Exists(reviewsFilePath))
    {
        try
        {
            var json = await File.ReadAllTextAsync(reviewsFilePath);
    
            //  JsonSerializer gestisce automaticamente i DateTime formattati "yyyy-MM-dd HH:mm:ss"
            var reviews = JsonSerializer.Deserialize<List<Review>>(json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    
            if (reviews != null && !db.Reviews.Any())
            {
                db.Reviews.AddRange(reviews);
                await db.SaveChangesAsync();

                // Raggruppa tutte le review per (PlaceId, CocktailId)
                var grouped = reviews
                    .Where(r => r.CocktailId != null)
                    .GroupBy(r => new
                    {
                        r.PlaceId,
                        CocktailId = r.CocktailId!
                    });
                
                foreach (var group in grouped)
                {
                    var placeId = group.Key.PlaceId;
                    var cocktailId = group.Key.CocktailId;
                    var count = group.Count();
                    var average = group.Average(r => r.Rating);

                    var meta = await db.CocktailReviewMetadatas
                        .FirstOrDefaultAsync(m => m.PlaceId == placeId && m.CocktailId == cocktailId);

                    if (meta == null)
                    {
                        meta = new CocktailReviewMetadata
                        {
                            PlaceId = placeId,
                            CocktailId = cocktailId,
                            ReviewCount = count,
                            AverageScore = average
                        };
                        db.CocktailReviewMetadatas.Add(meta);
                    }
                    else
                    {
                        // Ricalcola usando anche le review già presenti
                        var totalReviews = meta.ReviewCount + count;
                        meta.AverageScore = (meta.AverageScore * meta.ReviewCount + average * count) / totalReviews;
                        meta.ReviewCount = totalReviews;
                    }
                }
                await db.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Errore durante l'importazione delle reviews: {ex.Message}");
        }
    }
    else
    {
        Console.WriteLine("Il file reviews.json non è stato trovato.");
    }

}


app.UseStaticFiles(); // Serve i file da wwwroot

app.UseCors("AllowLocalhost");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
