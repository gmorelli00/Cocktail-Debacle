namespace backend.DTOs;

public class UpdateUserProfileDto
{   
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? OldPassword { get; set; }
    public string? NewPassword { get; set; }
    public string? ConfirmPassword { get; set; }
    public bool? ConsentData { get; set; }
    public bool? ConsentSuggestions { get; set; }

}
