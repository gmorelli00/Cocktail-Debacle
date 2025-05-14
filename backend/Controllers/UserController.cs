using backend.Entities;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using backend.DTOs;

namespace backend.Controllers;

[ApiController]
[Route("api/user")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly AppDbContext _context;

    public UserController(UserManager<User> userManager, AppDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        return Ok(new {
            user.UserName,
            user.Email,
            user.ConsentData,
            user.ConsentSuggestions
        });
    }

    [HttpPatch("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();
    
        // Controllo Username già in uso (da altri)
        if (!string.IsNullOrWhiteSpace(dto.Username) &&
            dto.Username != user.UserName &&
            await _userManager.Users.AnyAsync(u => u.UserName == dto.Username && u.Id != user.Id))
        {
            return BadRequest(new { message = "Username already in use." });
        }
    
        // Controllo Email già in uso (da altri)
        if (!string.IsNullOrWhiteSpace(dto.Email) &&
            dto.Email != user.Email &&
            await _userManager.Users.AnyAsync(u => u.Email == dto.Email && u.Id != user.Id))
        {
            return BadRequest(new { message = "Email already in use." });
        }
    
        // Aggiornamento Username ed Email
        if (!string.IsNullOrWhiteSpace(dto.Username))
            user.UserName = dto.Username;
    
        if (!string.IsNullOrWhiteSpace(dto.Email))
            user.Email = dto.Email;
    
        if (dto.ConsentData.HasValue)
            user.ConsentData = dto.ConsentData.Value;
    
        if (dto.ConsentSuggestions.HasValue)
            user.ConsentSuggestions = dto.ConsentSuggestions.Value;
    
        // Gestione password se non esiste
        if (string.IsNullOrWhiteSpace(user.PasswordHash))
        {
            if (!string.IsNullOrWhiteSpace(dto.NewPassword))
            {
                if (dto.NewPassword != dto.ConfirmPassword)
                    return BadRequest(new { message = "Password and confirmation do not match." });
    
                var addPasswordResult = await _userManager.AddPasswordAsync(user, dto.NewPassword);
                if (!addPasswordResult.Succeeded)
                    return BadRequest(addPasswordResult.Errors);
            }
        }
    
        // Cambio password classico
        if (!string.IsNullOrWhiteSpace(dto.OldPassword) && !string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            if (dto.NewPassword != dto.ConfirmPassword)
                return BadRequest(new { message = "Password and confirmation do not match." });
    
            var passwordChangeResult = await _userManager.ChangePasswordAsync(user, dto.OldPassword, dto.NewPassword);
            if (!passwordChangeResult.Succeeded)
                return BadRequest(passwordChangeResult.Errors);
        }
    
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(result.Errors);
    
        return Ok(new { message = "Profile updated successfully" });
    }

    [HttpDelete("profile")]
    public async Task<IActionResult> DeleteAccount([FromBody] DeleteUserDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
            return Unauthorized();

        // Conferma password
        var hasPassword = await _userManager.HasPasswordAsync(user);
        if (hasPassword)
        {
            var passwordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
            if (!passwordValid)
                return BadRequest(new { message = "Wrong Password" });
        }

         // Carica i dati collegati esplicitamente
        var userWithRelations = await _context.Users
            .Include(u => u.Reviews)
            .Include(u => u.Favorites)
            .Include(u => u.CreatedCocktails)
            .FirstOrDefaultAsync(u => u.Id == user.Id);

        if (userWithRelations == null)
            return NotFound();

        // Elimina manualmente le entità collegate (non gestite da cascade)
        _context.Reviews.RemoveRange(userWithRelations.Reviews);
        _context.UserFavorites.RemoveRange(userWithRelations.Favorites);

        // Scollega i cocktail creati dall’utente
        foreach (var cocktail in userWithRelations.CreatedCocktails)
        {
            cocktail.UserId = null;
            cocktail.CreatedBy = null;
        }

        await _context.SaveChangesAsync();

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        // Logout (opzionale): rimuovi il cookie JWT
        Response.Cookies.Delete("jwt");

        return Ok(new { message = "Account cancellato con successo." });
    }

}
