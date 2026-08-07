namespace PosApi.Models;

public class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; } = false;

    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? CostPrice { get; set; }
    public int StockQty { get; set; } // stok pusat (agregat); tiap outlet bisa punya OutletStock kalau perlu granular

    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }

    public bool IsActive { get; set; } = true;

    // Dipakai buat delta-sync: mobile client kirim "lastSyncAt" dan server balikin
    // produk yang UpdatedAt > lastSyncAt saja, biar hemat bandwidth.
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public bool IsDeleted { get; set; } = false;
}
