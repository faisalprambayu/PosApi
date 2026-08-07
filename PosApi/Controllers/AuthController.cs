using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PosApi.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PosApi.Controllers;

public class LoginRequest
{
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
}

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly PosDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(PosDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == req.Username && u.IsActive);
        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Username atau password salah" });

        var jwtSection = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new("role", user.Role.ToString()),
            new("outletId", user.OutletId?.ToString() ?? ""),
            new("fullName", user.FullName),
        };

        var token = new JwtSecurityToken(
            issuer: jwtSection["Issuer"],
            audience: jwtSection["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSection["ExpiryMinutes"]!)),
            signingCredentials: creds
        );

        return Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token),
            userId = user.Id,
            fullName = user.FullName,
            role = user.Role.ToString(),
            outletId = user.OutletId
        });
    }
}
