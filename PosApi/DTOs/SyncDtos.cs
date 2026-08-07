using PosApi.Models;

namespace PosApi.DTOs;

// ===== PULL: mobile minta data katalog terbaru (produk & kategori) =====
public class SyncPullRequest
{
    public DateTime? LastSyncAt { get; set; } // null = first sync, ambil semua
}

public class ProductDto
{
    public Guid Id { get; set; }
    public string Sku { get; set; } = "";
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int StockQty { get; set; }
    public Guid? CategoryId { get; set; }
    public bool IsActive { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public bool IsDeleted { get; set; }
}

public class SyncPullResponse
{
    public List<ProductDto> Products { get; set; } = new();
    public List<CategoryDto> Categories { get; set; } = new();
    // Client simpan ini, kirim lagi sebagai LastSyncAt di request berikutnya
    public DateTime ServerTimeUtc { get; set; } = DateTime.UtcNow;
}

// ===== PUSH: mobile kirim transaksi yang numpuk pas offline =====
public class TransactionItemDto
{
    public Guid ProductId { get; set; }
    public string ProductNameSnapshot { get; set; } = "";
    public decimal PriceSnapshot { get; set; }
    public int Qty { get; set; }
    public decimal Subtotal { get; set; }
}

public class TransactionDto
{
    // Id dibuat di client (lihat catatan di Models/Transaction.cs) -> aman di-retry
    public Guid Id { get; set; }
    public Guid OutletId { get; set; }
    public Guid CashierId { get; set; }
    public string TransactionNumber { get; set; } = "";
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal ChangeAmount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public DateTime TransactionTime { get; set; }
    public List<TransactionItemDto> Items { get; set; } = new();
}

public class SyncPushRequest
{
    public List<TransactionDto> Transactions { get; set; } = new();
}

public class SyncPushResultItem
{
    public Guid TransactionId { get; set; }
    public bool Success { get; set; }
    public string? Error { get; set; }
}

public class SyncPushResponse
{
    public List<SyncPushResultItem> Results { get; set; } = new();
}
