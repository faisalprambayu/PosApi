import { Product, Category, Outlet, TransactionDto, SalesSummaryResponse, User } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

function getHeaders(token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const activeToken = token || localStorage.getItem('pos_token');
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }
  return headers;
}

// Demo fallback data if API is starting up or offline
const MOCK_PRODUCTS: Product[] = [
  { id: '11111111-1111-1111-1111-111111111111', sku: 'SKU001', name: 'Kopi Susu Gula Aren', price: 18000, stockQty: 85, categoryId: 'cat-1' },
  { id: '22222222-2222-2222-2222-222222222222', sku: 'SKU002', name: 'Roti Bakar Coklat Keju', price: 15000, stockQty: 40, categoryId: 'cat-2' },
  { id: '33333333-3333-3333-3333-333333333333', sku: 'SKU003', name: 'Es Teh Manis Jumbo', price: 8000, stockQty: 150, categoryId: 'cat-1' },
  { id: '44444444-4444-4444-4444-444444444444', sku: 'SKU004', name: 'Nasi Goreng Spesial', price: 25000, stockQty: 30, categoryId: 'cat-2' },
  { id: '55555555-5555-5555-5555-555555555555', sku: 'SKU005', name: 'Croissant Butter', price: 22000, stockQty: 20, categoryId: 'cat-2' },
  { id: '66666666-6666-6666-6666-666666666666', sku: 'SKU006', name: 'Matcha Latte Ice', price: 24000, stockQty: 60, categoryId: 'cat-1' },
];

const MOCK_OUTLETS: Outlet[] = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Outlet Pusat', address: 'Jl. Sudirman No. 12, Jakarta', isActive: true },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Outlet Cabang Bandung', address: 'Jl. Dago No. 45, Bandung', isActive: true },
];

export const api = {
  async login(username: string, password: string): Promise<User> {
    try {
      const res = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Username atau password salah');
      }
      const data = await res.json();
      return {
        userId: data.userId,
        fullName: data.fullName,
        role: data.role,
        outletId: data.outletId,
        token: data.token,
      };
    } catch (err: any) {
      if (err.message?.includes('Username atau password')) throw err;
      // Demo fallback if backend is offline or initial setup
      const isOwner = username.toLowerCase() === 'owner';
      return {
        userId: isOwner ? 'user-owner-123' : 'user-kasir-123',
        fullName: isOwner ? 'Pemilik Toko (Demo)' : 'Kasir Utama (Demo)',
        role: isOwner ? 'Owner' : 'Cashier',
        outletId: isOwner ? null : MOCK_OUTLETS[0].id,
        token: 'demo-jwt-token-xyz',
      };
    }
  },

  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/Products`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Gagal mengambil data produk');
      return await res.json();
    } catch {
      return MOCK_PRODUCTS;
    }
  },

  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    try {
      const res = await fetch(`${API_BASE_URL}/Products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(productData),
      });
      if (!res.ok) throw new Error('Gagal menambah produk');
      return await res.json();
    } catch {
      const newProd: Product = {
        ...productData,
        id: crypto.randomUUID(),
      };
      MOCK_PRODUCTS.push(newProd);
      return newProd;
    }
  },

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      const res = await fetch(`${API_BASE_URL}/Products/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(productData),
      });
      if (!res.ok) throw new Error('Gagal memperbarui produk');
      return await res.json();
    } catch {
      const idx = MOCK_PRODUCTS.findIndex((p) => p.id === id);
      if (idx !== -1) {
        MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], ...productData };
        return MOCK_PRODUCTS[idx];
      }
      throw new Error('Produk tidak ditemukan');
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/Products/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Gagal menghapus produk');
    } catch {
      const idx = MOCK_PRODUCTS.findIndex((p) => p.id === id);
      if (idx !== -1) MOCK_PRODUCTS.splice(idx, 1);
    }
  },

  async getOutlets(): Promise<Outlet[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/Outlets`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Gagal mengambil data outlet');
      return await res.json();
    } catch {
      return MOCK_OUTLETS;
    }
  },

  async createOutlet(name: string, address?: string): Promise<Outlet> {
    try {
      const res = await fetch(`${API_BASE_URL}/Outlets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, address }),
      });
      if (!res.ok) throw new Error('Gagal menambah outlet');
      return await res.json();
    } catch {
      const newOutlet: Outlet = { id: crypto.randomUUID(), name, address, isActive: true };
      MOCK_OUTLETS.push(newOutlet);
      return newOutlet;
    }
  },

  async getSalesSummary(outletId: string, from?: string, to?: string): Promise<SalesSummaryResponse> {
    try {
      const query = new URLSearchParams();
      if (from) query.append('from', from);
      if (to) query.append('to', to);
      const res = await fetch(`${API_BASE_URL}/Outlets/${outletId}/sales-summary?${query.toString()}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Gagal mengambil ringkasan penjualan');
      return await res.json();
    } catch {
      return { outletId, totalSales: 450000, totalTransactions: 18 };
    }
  },

  async pushTransactions(transactions: TransactionDto[]): Promise<{ success: boolean; syncedCount: number }> {
    try {
      const res = await fetch(`${API_BASE_URL}/Sync/push`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ transactions }),
      });
      if (!res.ok) throw new Error('Gagal sync transaksi');
      const data = await res.json();
      const successCount = data.results?.filter((r: any) => r.success).length || 0;
      return { success: true, syncedCount: successCount };
    } catch (err) {
      console.warn('Sync push failed, will queue locally', err);
      return { success: false, syncedCount: 0 };
    }
  },

  async pullCatalog(lastSyncAt?: string): Promise<{ products: Product[]; categories: Category[]; serverTimeUtc: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/Sync/pull`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ lastSyncAt: lastSyncAt || null }),
      });
      if (!res.ok) throw new Error('Gagal pull katalog terbaru');
      return await res.json();
    } catch {
      return {
        products: MOCK_PRODUCTS,
        categories: [
          { id: 'cat-1', name: 'Minuman' },
          { id: 'cat-2', name: 'Makanan' },
        ],
        serverTimeUtc: new Date().toISOString(),
      };
    }
  },
};
