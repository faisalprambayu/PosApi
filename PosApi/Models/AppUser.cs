namespace PosApi.Models;

public enum UserRole
{
    Owner,      // akses semua outlet
    OutletAdmin,
    Cashier
}

public class AppUser
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Cashier;

    // Null jika Role == Owner (akses semua outlet)
    public Guid? OutletId { get; set; }
    public Outlet? Outlet { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
