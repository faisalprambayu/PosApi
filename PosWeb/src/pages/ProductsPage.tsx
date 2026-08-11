import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { Package, Plus, Search, Edit3, Trash2, X, Check, Tag, DollarSign, Layers } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [stockQty, setStockQty] = useState<number>(10);

  const canManage = user?.role === 'Owner' || user?.role === 'OutletAdmin';

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await api.getProducts();
    setProducts(data.filter((p) => !p.isDeleted));
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setSku(`SKU${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setPrice(15000);
    setCostPrice(10000);
    setStockQty(50);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setSku(product.sku);
    setName(product.name);
    setPrice(product.price);
    setCostPrice(product.costPrice || 0);
    setStockQty(product.stockQty);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0) return;

    if (editingProduct) {
      await api.updateProduct(editingProduct.id, { sku, name, price, costPrice, stockQty });
    } else {
      await api.createProduct({ sku, name, price, costPrice, stockQty });
    }

    setIsModalOpen(false);
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus produk ini?')) {
      await api.deleteProduct(id);
      loadProducts();
    }
  };

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-indigo-400" />
            <span>Katalog & Manajemen Produk</span>
          </h1>
          <p className="text-slate-400 text-xs font-medium mt-1">Kelola stok, harga jual, dan SKU produk toko</p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-all"
        />
      </div>

      {/* Products Table Card */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-4 px-6">SKU</th>
                <th className="py-4 px-6">Nama Produk</th>
                <th className="py-4 px-6">Harga Jual</th>
                <th className="py-4 px-6">Modal</th>
                <th className="py-4 px-6">Stok</th>
                {canManage && <th className="py-4 px-6 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Memuat katalog...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Belum ada produk yang sesuai
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-indigo-400">{prod.sku}</td>
                    <td className="py-4 px-6 font-bold text-white">{prod.name}</td>
                    <td className="py-4 px-6 text-emerald-400 font-bold">{formatRupiah(prod.price)}</td>
                    <td className="py-4 px-6 text-slate-400">{prod.costPrice ? formatRupiah(prod.costPrice) : '-'}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          prod.stockQty > 20
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : prod.stockQty > 0
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {prod.stockQty} unit
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base text-white">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Kode SKU</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Nama Produk</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Kopi Susu Aren"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Harga Modal (Rp)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Jumlah Stok</label>
                <input
                  type="number"
                  required
                  value={stockQty}
                  onChange={(e) => setStockQty(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all mt-2"
              >
                Simpan Produk
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
