using Microsoft.EntityFrameworkCore;
using PosApi.Models;

namespace PosApi.Data;

public class PosDbContext : DbContext
{
    public PosDbContext(DbContextOptions<PosDbContext> options) : base(options) { }

    public DbSet<Outlet> Outlets => Set<Outlet>();
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<TransactionItem> TransactionItems => Set<TransactionItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppUser>()
            .HasIndex(u => u.Username)
            .IsUnique();

        modelBuilder.Entity<Product>()
            .HasIndex(p => p.Sku)
            .IsUnique();

        modelBuilder.Entity<Transaction>()
            .HasIndex(t => t.TransactionNumber)
            .IsUnique();

        modelBuilder.Entity<Transaction>()
            .HasMany(t => t.Items)
            .WithOne(i => i.Transaction!)
            .HasForeignKey(i => i.TransactionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasPrecision(18, 2);
        modelBuilder.Entity<Product>()
            .Property(p => p.CostPrice)
            .HasPrecision(18, 2);
        modelBuilder.Entity<Transaction>()
            .Property(t => t.TotalAmount)
            .HasPrecision(18, 2);
        modelBuilder.Entity<Transaction>()
            .Property(t => t.PaidAmount)
            .HasPrecision(18, 2);
        modelBuilder.Entity<Transaction>()
            .Property(t => t.ChangeAmount)
            .HasPrecision(18, 2);
        modelBuilder.Entity<TransactionItem>()
            .Property(i => i.PriceSnapshot)
            .HasPrecision(18, 2);
        modelBuilder.Entity<TransactionItem>()
            .Property(i => i.Subtotal)
            .HasPrecision(18, 2);
    }
}
