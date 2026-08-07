using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PosApi.Data;
using PosApi.Models;

namespace PosApi.Controllers;

public class OutletUpsertRequest
{
    public string Name { get; set; } = "";
    public string? Address { get; set; }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OutletsController : ControllerBase
{
    private readonly PosDbContext _db;
    public OutletsController(PosDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _db.Outlets.Where(o => o.IsActive).ToListAsync());

    [HttpPost]
    [Authorize(Roles = "Owner")]
    public async Task<IActionResult> Create(OutletUpsertRequest req)
    {
        var outlet = new Outlet { Name = req.Name, Address = req.Address };
        _db.Outlets.Add(outlet);
        await _db.SaveChangesAsync();
        return Ok(outlet);
    }

    // Laporan penjualan gabungan semua outlet (pusat) - dasar buat fitur laporan nanti
    [HttpGet("{id}/sales-summary")]
    [Authorize(Roles = "Owner,OutletAdmin")]
    public async Task<IActionResult> SalesSummary(Guid id, DateTime? from, DateTime? to)
    {
        var query = _db.Transactions.Where(t => t.OutletId == id && t.Status == TransactionStatus.Completed);
        if (from is not null) query = query.Where(t => t.TransactionTime >= from);
        if (to is not null) query = query.Where(t => t.TransactionTime <= to);

        var totalSales = await query.SumAsync(t => t.TotalAmount);
        var totalTransactions = await query.CountAsync();

        return Ok(new { outletId = id, totalSales, totalTransactions });
    }
}
