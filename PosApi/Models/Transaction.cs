namespace PosApi.Models;

public enum PaymentMethod
{
    Cash,
    Qris,
    DebitCredit,
    Other
}

public enum TransactionStatus
{
    Completed,
    Voided
}

public class Transaction
{
    // PENTING: Id di-generate di MOBILE (client) saat checkout, bukan di server.
    // Ini kunci arsitektur offline-first: kasir bisa checkout tanpa internet,
    // lalu transaksi disimpan lokal dan dikirim ke server begitu online lagi.
    // Karena Id sudah pasti (Guid dari client), kalau sync gagal di tengah jalan
    // dan di-retry, server tinggal cek "Id ini sudah ada belum?" -> idempotent,
    // nggak akan double-insert walau request dikirim 2x.
    public Guid Id { get; set; }

    public Guid OutletId { get; set; }
    public Outlet? Outlet { get; set; }

    public Guid CashierId { get; set; }
    public AppUser? Cashier { get; set; }

    public string TransactionNumber { get; set; } = string.Empty; // no. struk, format: <outlet-code>-yyyyMMdd-xxxx, dibuat di client
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal ChangeAmount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public TransactionStatus Status { get; set; } = TransactionStatus.Completed;

    // Waktu transaksi SEBENARNYA terjadi di HP (bisa jauh sebelum CreatedAtServer kalau lama offline)
    public DateTime TransactionTime { get; set; }
    // Waktu transaksi ini sampai & disimpan di server
    public DateTime CreatedAtServer { get; set; } = DateTime.UtcNow;

    public ICollection<TransactionItem> Items { get; set; } = new List<TransactionItem>();
}

public class TransactionItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TransactionId { get; set; }
    public Transaction? Transaction { get; set; }

    public Guid ProductId { get; set; }
    public string ProductNameSnapshot { get; set; } = string.Empty; // snapshot nama saat transaksi (jaga2 nama produk berubah kemudian)
    public decimal PriceSnapshot { get; set; } // snapshot harga saat transaksi
    public int Qty { get; set; }
    public decimal Subtotal { get; set; }
}
