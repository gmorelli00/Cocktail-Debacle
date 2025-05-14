using backend.Entities;
using Microsoft.AspNetCore.Identity;
using System.Text.RegularExpressions;

namespace backend.Services;

public class UserNameService
{
    private readonly UserManager<User> _userManager;

    public UserNameService(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    public async Task<string> GenerateValidUserNameAsync(string? displayName, string? email = null)
    {
        // 1. Fallback se il nome è nullo
        string? baseUserName = displayName;

        if (string.IsNullOrWhiteSpace(baseUserName))
        {
            if (!string.IsNullOrWhiteSpace(email))
                baseUserName = email.Split('@')[0];
            else
                baseUserName = "user";
        }

        // 2. Pulizia del nome
        baseUserName = baseUserName
            .ToLowerInvariant()
            .Replace(" ", "_")
            .Replace("-", "_")
            .Replace("'", "")
            .Replace(".", "")
            .Replace(",", "");

        baseUserName = Regex.Replace(baseUserName, @"[^a-zA-Z0-9_]", "");

        if (baseUserName.Length > 20)
            baseUserName = baseUserName.Substring(0, 20);

        // 3. Controlla se è unico, altrimenti aggiungi numeri progressivi
        string finalUserName = baseUserName;
        int suffix = 1;

        while (await _userManager.FindByNameAsync(finalUserName) is not null)
        {
            finalUserName = baseUserName + "_" + suffix;
            suffix++;

            if (finalUserName.Length > 20)
                finalUserName = finalUserName.Substring(0, 20);
        }

        return finalUserName;
    }
}