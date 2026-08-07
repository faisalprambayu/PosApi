using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PosApi.Data;
using PosApi.Models;

namespace PosApi.Controllers;

public class ProductUpsertRequest
{
    public string Sku { get; set; } = "";
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public decimal? CostPrice { get; set; }
    public int StockQty { get; set; }
    public Guid? CategoryId { get; set; }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly PosDbContext _db;
    public ProductsController(PosDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _db.Products.Where(p => !p.IsDeleted).ToListAsync());

    [HttpPost]
    [Authorize(Roles = "Owner,OutletAdmin")]
    public async Task<IActionResult> Create(ProductUpsertRequest req)
    {
        var product = new Product
        {
            Sku = req.Sku,
            Name = req.Name,
            Price = req.Price,
            CostPrice = req.CostPrice,
            StockQty = req.StockQty,
            CategoryId = req.CategoryId,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return Ok(product);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Owner,OutletAdmin")]
    public async Task<IActionResult> Update(Guid id, ProductUpsertRequest req)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return NotFound();

        product.Sku = req.Sku;
        product.Name = req.Name;
        product.Price = req.Price;
        product.CostPrice = req.CostPrice;
        product.StockQty = req.StockQty;
        product.CategoryId = req.CategoryId;
        product.UpdatedAt = DateTime.UtcNow; // penting: dipakai buat delta-sync ke mobile

        await _db.SaveChangesAsync();
        return Ok(product);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Owner,OutletAdmin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return NotFound();

        // Soft delete, biar mobile client yang masih nyimpen cache lama tahu
        // untuk buang produk ini juga pas sync berikutnya.
        product.IsDeleted = true;
        product.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
