import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import { RefreshCw, UploadCloud, DownloadCloud, CheckCircle, Clock, AlertTriangle, Layers, Trash2 } from 'lucide-react';

export const SyncPage: React.FC = () => {
  const { offlineQueue, clearOfflineQueue } = useCart();
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handlePushSync = async () => {
    if (offlineQueue.length === 0) return;
    setSyncing(true);
    setSyncMessage(null);

    const res = await api.pushTransactions(offlineQueue);
    if (res.success) {
      setSyncMessage(`Berhasil menyinkronkan ${res.syncedCount} transaksi ke server .NET API!`);
      clearOfflineQueue();
    } else {
      setSyncMessage('Gagal menyinkronkan transaksi. Pastikan koneksi server terhubung.');
    }
    setSyncing(false);
  };

  const handlePullSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const catalog = await api.pullCatalog();
      setSyncMessage(`Katalog berhasil diperbarui! (${catalog.products.length} Produk, ${catalog.categories.length} Kategori)`);
    } catch {
      setSyncMessage('Gagal memperbarui katalog dari server.');
    } finally {
      setSyncing(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <RefreshCw className="w-7 h-7 text-indigo-400" />
          <span>Offline & Sync Manager</span>
        </h1>
        <p className="text-slate-400 text-xs font-medium mt-1">
          Sinkronisasi transaksi offline dan penarikan update produk dari server .NET PosApi
        </p>
      </div>

      {syncMessage && (
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Sync Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Push Sync Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Antrean Transaksi</span>
              <h3 className="text-2xl font-black text-white mt-1">{offlineQueue.length} Transaksi Offline</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <UploadCloud className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Transaksi yang terjadi saat kasir tanpa jaringan internet disimpan secara aman di browser local queue.
          </p>

          <button
            disabled={syncing || offlineQueue.length === 0}
            onClick={handlePushSync}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{syncing ? 'Menyinkronkan...' : 'Setor Transaksi ke Server'}</span>
          </button>
        </div>

        {/* Pull Sync Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">Delta Catalog Pull</span>
              <h3 className="text-2xl font-black text-white mt-1">Update Produk</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <DownloadCloud className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Tarik data produk baru, harga terbaru, serta produk yang dihapus dari server pusat.
          </p>

          <button
            disabled={syncing}
            onClick={handlePullSync}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>{syncing ? 'Mengunduh...' : 'Pull Katalog Terbaru'}</span>
          </button>
        </div>
      </div>

      {/* Queue Items List */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Daftar Transaksi Belum Terkirim ({offlineQueue.length})</span>
          </h3>
          {offlineQueue.length > 0 && (
            <button
              onClick={clearOfflineQueue}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Antrean</span>
            </button>
          )}
        </div>

        {offlineQueue.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            Tidak ada transaksi pending. Semua transaksi sudah tersimpan di server!
          </div>
        ) : (
          <div className="space-y-2.5">
            {offlineQueue.map((tx) => (
              <div key={tx.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="font-mono font-bold text-amber-400">{tx.transactionNumber}</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">{new Date(tx.transactionTime).toLocaleString('id-ID')}</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-white text-sm">{formatRupiah(tx.totalAmount)}</span>
                  <p className="text-[10px] text-slate-500">{tx.items.length} item barang</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
