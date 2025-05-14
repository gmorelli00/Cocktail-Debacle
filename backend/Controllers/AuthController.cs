using backend.DTOs;
using backend.Entities;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Google;
using System.Text.Json.Serialization;
using System.Text.Json;




namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IConfiguration _config;
    private readonly JwtService _jwtService;
    private readonly UserNameService _userNameService;

    public AuthController(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IConfiguration config,
        JwtService jwtService,
        UserNameService userNameService
    )
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _config = config;
        _jwtService = jwtService;
        _userNameService = userNameService;
    }

    // POST /auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(new { message = string.Join("; ", errors) });
        }

        if (dto.Password != dto.ConfirmPassword)
            return BadRequest(new { message = "Passwords do not match" });

        var user = new User
        {
            UserName = dto.Username,
            Email = dto.Email,
            ConsentData = dto.ConsentData,
            ConsentSuggestions = dto.ConsentSuggestions
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
             var errorMessages = result.Errors.Select(e => e.Description).ToList();
            return BadRequest(new { message = string.Join("; ", errorMessages) });
        }
        // Effettua il login automatico
        var signInResult = await _signInManager.PasswordSignInAsync(user, dto.Password, false, false);
        
        if (!signInResult.Succeeded)
            return Unauthorized(new { message = "Login failed after registration." });

        // Genera il token JWT
        var token = _jwtService.GenerateToken(user);
        SetJwtCookie(token);  // Salva il token nel cookie HttpOnly

        return Ok(new { message = "Registration and login successful" });
    }


    // POST /auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _userManager.FindByNameAsync(dto.UsernameOrEmail)
                   ?? await _userManager.FindByEmailAsync(dto.UsernameOrEmail);

        if (user == null)
            return Unauthorized(new { message = "Invalid Username or Email" });

        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);

        if (!result.Succeeded)
            return Unauthorized(new { message = "Invalid Password" });

        var token = _jwtService.GenerateToken(user);
        SetJwtCookie(token);
        return Ok(new { message = "Login successful" });

    }

    // GET /auth/google-login
    [HttpGet("google-login")]
    public IActionResult GoogleLogin()
    {
        var clientId = _config["Authentication:Google:ClientId"];
        var redirectUri = "http://localhost/api/auth/google-response";
        var scope = "openid email profile";
        var state = Guid.NewGuid().ToString(); // opzionale: salva per sicurezza anti-CSRF

        var url = $"https://accounts.google.com/o/oauth2/v2/auth" +
                  $"?response_type=code" +
                  $"&client_id={clientId}" +
                  $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
                  $"&scope={Uri.EscapeDataString(scope)}" +
                  $"&state={state}" +
                  $"&access_type=offline";

        return Redirect(url);
    }

    // GET /auth/google-response
    [HttpGet("google-response")]
    public async Task<IActionResult> GoogleResponse([FromQuery] string code)
    {
        if (string.IsNullOrEmpty(code))
            return BadRequest("Codice non fornito");

        var tokenResponse = await ScambiaCodePerToken(code);
        if (tokenResponse == null || string.IsNullOrEmpty(tokenResponse.AccessToken))
            return BadRequest("Errore durante lo scambio del codice");
        var userInfo = await OttieniInfoUtente(tokenResponse.AccessToken);

        // Qui puoi creare la sessione
        await AutenticaUtente(userInfo);

        return Redirect("/");
    }

    private async Task<TokenResponse> ScambiaCodePerToken(string code)
    {
        var clientId = _config["Authentication:Google:ClientId"] ?? throw new InvalidOperationException("ClientId non configurato");
        var clientSecret = _config["Authentication:Google:ClientSecret"] ?? throw new InvalidOperationException("ClientSecret non configurato");
        var redirectUri = "http://localhost/api/auth/google-response";

        var httpClient = new HttpClient();
        var request = new HttpRequestMessage(HttpMethod.Post, "https://oauth2.googleapis.com/token")
        {
            Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "code", code },
                { "client_id", clientId },
                { "client_secret", clientSecret },
                { "redirect_uri", redirectUri },
                { "grant_type", "authorization_code" }
            })
        };

        var response = await httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();

        var deserialized = JsonSerializer.Deserialize<TokenResponse>(content);
        if (deserialized == null)
            throw new InvalidOperationException("Errore di deserializzazione");

        return deserialized;
    }

    private class TokenResponse
    {
        [JsonPropertyName("access_token")]
        public string? AccessToken { get; set; }

        [JsonPropertyName("id_token")]
        public string? IdToken { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonPropertyName("refresh_token")]
        public string? RefreshToken { get; set; }
    }

    private async Task AutenticaUtente(GoogleLoginDto userInfo)
    {
        // Verifica se l'utente esiste già nel database per l'email
        if (string.IsNullOrEmpty(userInfo.Email))
            throw new InvalidOperationException("Email mancante");

        var user = await _userManager.FindByEmailAsync(userInfo.Email);

        
        if (user == null)
        {
            // Se l'utente non esiste, crea uno username univoco
            var userName = await GenerateUniqueUserName(userInfo.GivenName + userInfo.FamilyName);

            user = new User
            {
                UserName = userName,  // Username univoco generato
                Email = userInfo.Email,
                Provider = "Google",  // Provider di autenticazione
                ProviderId = userInfo.Sub,  // L'ID del provider (Google)
                ConsentData = true,  // Imposta a true o aggiungi logica per chiedere il consenso
                ConsentSuggestions = true,  // Imposta a true o aggiungi logica per chiedere il consenso
                CreatedAt = DateTime.UtcNow
            };
            
            var result = await _userManager.CreateAsync(user);
            if (!result.Succeeded)
                throw new InvalidOperationException("Errore durante la creazione dell'utente.");
        }

        // Genera il token JWT
        var token = _jwtService.GenerateToken(user);
        SetJwtCookie(token);

        // Nessun salvataggio aggiuntivo nel database, l'utente è autenticato
        await Task.CompletedTask;
    }

private async Task<string> GenerateUniqueUserName(string baseUserName)
{
    string userName = baseUserName;
    int counter = 1;

    // Controlla se lo username esiste già nel database
    while (await _userManager.FindByNameAsync(userName) != null)
    {
        // Aggiungi un numero incrementale per renderlo unico
        userName = baseUserName + counter;
        counter++;
    }

    return userName;
}

    private async Task<GoogleLoginDto> OttieniInfoUtente(string accessToken)
    {
        var httpClient = new HttpClient();
        var request = new HttpRequestMessage(HttpMethod.Get, "https://openidconnect.googleapis.com/v1/userinfo");
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var response = await httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();

        var deserialized = JsonSerializer.Deserialize<GoogleLoginDto>(content);
        if (deserialized == null)
            throw new InvalidOperationException("Errore di deserializzazione");

        return deserialized;
    }

    private void SetJwtCookie(string token)
    {
        var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                SameSite = SameSiteMode.Lax,
                Secure = false, // solo in HTTPS
                Expires = DateTime.UtcNow.AddDays(7)
            };
        Response.Cookies.Append("jwt", token, cookieOptions);
    }

    [HttpGet("is-logged-in")]
    public IActionResult IsLoggedIn()
    {
        var jwt = Request.Cookies["jwt"];

        if (string.IsNullOrEmpty(jwt))
            return Unauthorized();

        var principal = _jwtService.ValidateToken(jwt);

        if (principal == null)
            return Unauthorized();

        return Ok(new { message = "Authenticated" });
    }

    [HttpGet("me")]
    public IActionResult Me()
    {
        var jwt = Request.Cookies["jwt"];

        if (string.IsNullOrEmpty(jwt))
            return Unauthorized();

        var principal = _jwtService.ValidateToken(jwt);

        if (principal == null)
            return Unauthorized();

        var username = principal.Identity?.Name;
        return Ok(new { username });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("jwt");
        return Ok(new { message = "Logout successful" });
    }
}