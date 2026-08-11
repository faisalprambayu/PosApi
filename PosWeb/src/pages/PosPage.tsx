import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import { Product, PaymentMethod, TransactionDto, PaymentMethodNames } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  QrCode,
  Banknote,
  Sparkles,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const PosPage: React.FC = () => {
  const { user, activeOutletId } = useAuth();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, totalItemsCount, addOfflineTransaction } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Payment Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(0); // 0: Cash
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [completedTransaction, setCompletedTransaction] = useState<TransactionDto | null>(null);

  // Mobile cart drawer state
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const catalog = await api.pullCatalog();
    setProducts(catalog.products.filter((p) => !p.isDeleted));
    setCategories(catalog.categories.filter((c) => !c.isDeleted));
    setLoading(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setPaidAmount(totalAmount);
    setIsCheckoutOpen(true);
  };

  const handleQuickCash = (amount: number) => {
    setPaidAmount(amount);
  };

  const changeAmount = Math.max(0, paidAmount - totalAmount);

  const handleCompletePayment = async () => {
    if (paymentMethod === 0 && paidAmount < totalAmount) {
      alert('Nominal pembayaran kurang!');
      return;
    }

    const txId = crypto.randomUUID();
    const txNumber = `OUT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const transaction: TransactionDto = {
      id: txId,
      outletId: activeOutletId,
      cashierId: user?.userId || 'user-kasir-123',
      transactionNumber: txNumber,
      totalAmount,
      paidAmount: paymentMethod === 0 ? paidAmount : totalAmount,
      changeAmount: paymentMethod === 0 ? changeAmount : 0,
      paymentMethod,
      transactionTime: new Date().toISOString(),
      cashierName: user?.fullName || 'Kasir Utama',
      items: cart.map((item) => ({
        productId: item.product.id,
        productNameSnapshot: item.product.name,
        priceSnapshot: item.product.price,
        qty: item.qty,
        subtotal: item.product.price * item.qty,
      })),
    };

    // Attempt online sync push
    const res = await api.pushTransactions([transaction]);
    if (!res.success) {
      // Offline queue fallback
      addOfflineTransaction({ ...transaction, status: 'PendingOffline' });
    }

    setCompletedTransaction(transaction);
    clearCart();
    setIsCheckoutOpen(false);
    setIsMobileCartOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      {/* LEFT: Product Catalog & Search (Responsive Grid) */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
        {/* Search & Filter Header */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama produk atau SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
              />
            </div>

            {/* Quick Mobile Cart Trigger */}
            <button
              onClick={() => setIsMobileCartOpen(true)}
              className="lg:hidden flex items-center justify-between gap-3 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Keranjang ({totalItemsCount})</span>
              </div>
              <span>{formatRupiah(totalAmount)}</span>
            </button>
          </div>

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Semua Produk ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-slate-400 text-xs font-semibold">Memuat produk...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-bold text-sm">Produk Tidak Ditemukan</p>
              <p className="text-slate-500 text-xs mt-1">Coba kata kunci pencarian atau kategori lain</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 pb-20 lg:pb-0">
            {filteredProducts.map((product) => {
              const inCart = cart.find((item) => item.product.id === product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`glass-panel p-4 rounded-2xl cursor-pointer transition-all duration-200 relative group flex flex-col justify-between ${
                    inCart
                      ? 'border-indigo-500/80 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                      : 'hover:border-indigo-500/40 hover:bg-slate-900/90'
                  }`}
                >
                  {inCart && (
                    <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shadow-md animate-scale-in">
                      {inCart.qty}
                    </span>
                  )}
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">{product.sku}</span>
                    <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 mt-1">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <span className="font-black text-sm text-emerald-400">{formatRupiah(product.price)}</span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                      Stok: {product.stockQty}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT: Cart Register Sidebar (Desktop & Drawer Mobile) */}
      <div
        className={`fixed lg:relative inset-y-0 right-0 z-40 w-full lg:w-96 glass-panel border-l border-slate-800/80 bg-slate-950/95 flex flex-col transition-transform duration-300 ${
          isMobileCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Cart Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            <h2 className="font-extrabold text-base text-white">Keranjang POS</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold">
              {totalItemsCount} item
            </span>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                Kosongkan
              </button>
            )}
            <button
              onClick={() => setIsMobileCartOpen(false)}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <ShoppingBag className="w-12 h-12 stroke-[1.5] mb-2 text-slate-700" />
              <p className="font-bold text-sm text-slate-400">Keranjang Kosong</p>
              <p className="text-xs mt-1">Pilih produk di sebelah kiri untuk ditambahkan</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-slate-100">{item.product.name}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">{formatRupiah(item.product.price)} / item</p>
                  </div>
                  <span className="font-extrabold text-xs text-emerald-400">
                    {formatRupiah(item.product.price * item.qty)}
                  </span>
                </div>

                {/* Qty Adjustment Controls */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.qty - 1)}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-extrabold text-xs text-white">{item.qty}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.qty + 1)}
                      className="w-6 h-6 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & Checkout Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-slate-900/60 space-y-4">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>{formatRupiah(totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Pajak (0%)</span>
              <span>Rp 0</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
              <span>Total Tagihan</span>
              <span className="text-indigo-400">{formatRupiah(totalAmount)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={handleOpenCheckout}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-4 h-4" />
            <span>Bayar Pembelian</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* CHECKOUT PAYMENT MODAL */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-lg text-white">Proses Pembayaran</h3>
                <p className="text-xs text-slate-400">Pilih metode bayar & masukkan nominal</p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Display */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Total Pembayaran</p>
              <p className="text-3xl font-black text-white mt-1">{formatRupiah(totalAmount)}</p>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                Metode Pembayaran
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 0, label: 'Tunai (Cash)', icon: Banknote },
                  { id: 1, label: 'QRIS', icon: QrCode },
                  { id: 2, label: 'Debit / Kredit', icon: CreditCard },
                  { id: 3, label: 'Lainnya', icon: Layers },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Input & Quick Buttons */}
            {paymentMethod === 0 && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Uang Diterima</label>
                <input
                  type="number"
                  value={paidAmount || ''}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xl font-bold text-emerald-400 focus:outline-none focus:border-indigo-500"
                />

                {/* Quick Cash Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleQuickCash(totalAmount)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-lg"
                  >
                    Uang Pas
                  </button>
                  {[10000, 20000, 50000, 100000].map((nominal) => (
                    <button
                      key={nominal}
                      onClick={() => handleQuickCash(nominal)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-lg"
                    >
                      {formatRupiah(nominal)}
                    </button>
                  ))}
                </div>

                {/* Change calculation */}
                <div className="flex justify-between items-center pt-2 text-sm font-bold">
                  <span className="text-slate-400">Kembalian:</span>
                  <span className="text-lg text-emerald-400">{formatRupiah(changeAmount)}</span>
                </div>
              </div>
            )}

            {/* Modal Submit */}
            <button
              onClick={handleCompletePayment}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Selesaikan & Simpan Transaksi</span>
            </button>
          </div>
        </div>
      )}

      {/* PRINT RECEIPT MODAL */}
      <ReceiptModal transaction={completedTransaction} onClose={() => setCompletedTransaction(null)} />
    </div>
  );
};
