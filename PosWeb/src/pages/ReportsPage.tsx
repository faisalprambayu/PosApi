import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Outlet, SalesSummaryResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Store, Plus, TrendingUp, ShoppingBag, DollarSign, Calendar, MapPin, X } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { user, activeOutletId, setActiveOutletId } = useAuth();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [summary, setSummary] = useState<SalesSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // New Outlet Modal
  const [isAddOutletOpen, setIsAddOutletOpen] = useState(false);
  const [newOutletName, setNewOutletName] = useState('');
  const [newOutletAddress, setNewOutletAddress] = useState('');

  useEffect(() => {
    loadOutlets();
  }, []);

  useEffect(() => {
    if (activeOutletId) {
      loadSummary(activeOutletId);
    }
  }, [activeOutletId]);

  const loadOutlets = async () => {
    const list = await api.getOutlets();
    setOutlets(list);
    if (list.length > 0 && !activeOutletId) {
      setActiveOutletId(list[0].id);
    }
  };

  const loadSummary = async (outletId: string) => {
    setLoading(true);
    const data = await api.getSalesSummary(outletId);
    setSummary(data);
    setLoading(false);
  };

  const handleCreateOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOutletName) return;

    await api.createOutlet(newOutletName, newOutletAddress);
    setNewOutletName('');
    setNewOutletAddress('');
    setIsAddOutletOpen(false);
    loadOutlets();
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const activeOutlet = outlets.find((o) => o.id === activeOutletId);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            <span>Laporan Penjualan & Outlet</span>
          </h1>
          <p className="text-slate-400 text-xs font-medium mt-1">Ringkasan performa omset dan transaksi per cabang toko</p>
        </div>

        {user?.role === 'Owner' && (
          <button
            onClick={() => setIsAddOutletOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Outlet Cabang</span>
          </button>
        )}
      </div>

      {/* Outlet Selector Bar */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {outlets.map((outlet) => {
          const isSelected = activeOutletId === outlet.id;
          return (
            <button
              key={outlet.id}
              onClick={() => setActiveOutletId(outlet.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'glass-panel text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>{outlet.name}</span>
            </button>
          );
        })}
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Penjualan / Omset</p>
              <h3 className="text-3xl font-black text-emerald-400 mt-2">
                {loading ? '...' : formatRupiah(summary?.totalSales || 0)}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">Statistik penjualan riil untuk {activeOutlet?.name || 'Outlet'}</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Transaksi</p>
              <h3 className="text-3xl font-black text-indigo-400 mt-2">
                {loading ? '...' : `${summary?.totalTransactions || 0} Trx`}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">Jumlah pesanan selesai di kasir</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-slate-800 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Rata-rata Basket Size</p>
              <h3 className="text-3xl font-black text-purple-400 mt-2">
                {loading
                  ? '...'
                  : formatRupiah(
                      summary?.totalTransactions ? Math.round(summary.totalSales / summary.totalTransactions) : 0
                    )}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">Nilai rata-rata pembelian per pelanggan</p>
        </div>
      </div>

      {/* Outlet Information Card */}
      {activeOutlet && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-400" />
            <span>Detail Cabang Toko Active</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 pt-2">
            <div>
              <span className="text-slate-500 block">Nama Outlet:</span>
              <span className="font-bold text-slate-100 text-sm">{activeOutlet.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Alamat Fisik:</span>
              <span className="font-bold text-slate-100 text-sm">{activeOutlet.address || 'Alamat belum disetting'}</span>
            </div>
          </div>
        </div>
      )}

      {/* CREATE OUTLET MODAL */}
      {isAddOutletOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base text-white">Tambah Outlet Cabang Baru</h3>
              <button onClick={() => setIsAddOutletOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOutlet} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Nama Outlet</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Outlet Cabang Surabaya"
                  value={newOutletName}
                  onChange={(e) => setNewOutletName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Alamat Outlet</label>
                <textarea
                  placeholder="Contoh: Jl. Tunjungan No. 88, Surabaya"
                  value={newOutletAddress}
                  onChange={(e) => setNewOutletAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white h-24"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all mt-2"
              >
                Simpan Outlet
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
