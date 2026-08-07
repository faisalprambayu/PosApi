using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PosApi.Data;
using PosApi.DTOs;
using PosApi.Models;

namespace PosApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SyncController : ControllerBase
{
    private readonly PosDbContext _db;

    public SyncController(PosDbContext db)
    {
        _db = db;
    }

    // Mobile panggil ini pas nyala/ada koneksi, buat narik update katalog
    // (produk baru, harga berubah, produk dihapus) sejak sync terakhir.
    [HttpPost("pull")]
    public async Task<ActionResult<SyncPullResponse>> Pull(SyncPullRequest req)
    {
        var productsQuery = _db.Products.AsQueryable();
        var categoriesQuery = _db.Categories.AsQueryable();

        if (req.LastSyncAt is not null)
        {
            productsQuery = productsQuery.Where(p => p.UpdatedAt > req.LastSyncAt);
            categoriesQuery = categoriesQuery.Where(c => c.UpdatedAt > req.LastSyncAt);
        }

        var products = await productsQuery.Select(p => new ProductDto
        {
            Id = p.Id,
            Sku = p.Sku,
            Name = p.Name,
            Price = p.Price,
            StockQty = p.StockQty,
            CategoryId = p.CategoryId,
            IsActive = p.IsActive,
            IsDeleted = p.IsDeleted,
            UpdatedAt = p.UpdatedAt
        }).ToListAsync();

        var categories = await categoriesQuery.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            IsDeleted = c.IsDeleted
        }).ToListAsync();

        return Ok(new SyncPullResponse
        {
            Products = products,
            Categories = categories,
            ServerTimeUtc = DateTime.UtcNow
        });
    }

    // Mobile panggil ini buat "setor" transaksi yang menumpuk pas offline.
    // Idempotent: kalau Id transaksi sudah ada di server (misal request sempat
    // terkirim tapi jawaban servernya nggak sampai ke HP, lalu di-retry),
    // transaksi itu dianggap sukses tanpa dobel insert.
    [HttpPost("push")]
    public async Task<ActionResult<SyncPushResponse>> Push(SyncPushRequest req)
    {
        var response = new SyncPushResponse();

        foreach (var tx in req.Transactions)
        {
            var existing = await _db.Transactions.FindAsync(tx.Id);
            if (existing is not null)
            {
                response.Results.Add(new SyncPushResultItem { TransactionId = tx.Id, Success = true });
                continue;
            }

            try
            {
                var entity = new Transaction
                {
                    Id = tx.Id,
                    OutletId = tx.OutletId,
                    CashierId = tx.CashierId,
                    TransactionNumber = tx.TransactionNumber,
                    TotalAmount = tx.TotalAmount,
                    PaidAmount = tx.PaidAmount,
                    ChangeAmount = tx.ChangeAmount,
                    PaymentMethod = tx.PaymentMethod,
                    TransactionTime = tx.TransactionTime,
                    CreatedAtServer = DateTime.UtcNow,
                    Items = tx.Items.Select(i => new TransactionItem
                    {
                        ProductId = i.ProductId,
                        ProductNameSnapshot = i.ProductNameSnapshot,
                        PriceSnapshot = i.PriceSnapshot,
                        Qty = i.Qty,
                        Subtotal = i.Subtotal
                    }).ToList()
                };

                _db.Transactions.Add(entity);

                // Kurangi stok pusat (opsional — tergantung apakah kamu mau stok
                // per-outlet terpisah atau agregat; ini contoh agregat sederhana)
                foreach (var item in tx.Items)
                {
                    var product = await _db.Products.FindAsync(item.ProductId);
                    if (product is not null)
                        product.StockQty -= item.Qty;
                }

                await _db.SaveChangesAsync();
                response.Results.Add(new SyncPushResultItem { TransactionId = tx.Id, Success = true });
            }
            catch (Exception ex)
            {
                response.Results.Add(new SyncPushResultItem
                {
                    TransactionId = tx.Id,
                    Success = false,
                    Error = ex.Message
                });
            }
        }

        return Ok(response);
    }
}
