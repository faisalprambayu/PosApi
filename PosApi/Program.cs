using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PosApi.Data;
using PosApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "POS API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
    });
    c.AddSecurityRequirement(new()
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddDbContext<PosDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("Default")));

var jwtSection = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!)),
            RoleClaimType = "role"
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddCors(opt =>
{
    // Longgar buat dev; ketatkan (whitelist origin spesifik) sebelum production
    opt.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

// Auto-migrate + seed data dev biar begitu `dotnet run`, langsung ada 1 outlet + 1 owner + beberapa produk
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PosDbContext>();
    db.Database.EnsureCreated();

    if (!db.Outlets.Any())
    {
        var outlet = new Outlet { Name = "Outlet Pusat" };
        db.Outlets.Add(outlet);

        var owner = new AppUser
        {
            Username = "owner",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("owner123"), // GANTI sebelum production!
            FullName = "Pemilik Toko",
            Role = UserRole.Owner
        };
        db.Users.Add(owner);

        var kasir = new AppUser
        {
            Username = "kasir1",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("kasir123"),
            FullName = "Kasir Outlet Pusat",
            Role = UserRole.Cashier,
            OutletId = outlet.Id
        };
        db.Users.Add(kasir);

        var kategori = new Category { Name = "Umum" };
        db.Categories.Add(kategori);

        db.Products.AddRange(
            new Product { Sku = "SKU001", Name = "Kopi Susu", Price = 15000, StockQty = 100, CategoryId = kategori.Id },
            new Product { Sku = "SKU002", Name = "Roti Bakar", Price = 12000, StockQty = 50, CategoryId = kategori.Id },
            new Product { Sku = "SKU003", Name = "Es Teh", Price = 8000, StockQty = 200, CategoryId = kategori.Id }
        );

        db.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
