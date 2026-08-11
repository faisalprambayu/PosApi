import React from 'react';
import { TransactionDto, PaymentMethodNames } from '../types';
import { Printer, CheckCircle2, X, Download, Share2 } from 'lucide-react';

interface ReceiptModalProps {
  transaction: TransactionDto | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const formattedDate = new Date(transaction.transactionTime).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Transaksi Berhasil</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt Content */}
        <div className="p-6 overflow-y-auto bg-slate-950 text-slate-100 font-mono text-xs" id="printable-receipt">
          {/* Header Store Info */}
          <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-700">
            <h2 className="text-base font-extrabold uppercase text-slate-100 tracking-wider">KASIR POS STORE</h2>
            <p className="text-[11px] text-slate-400">Jl. Sudirman No. 12, Jakarta</p>
            <p className="text-[11px] text-slate-400">Telp: 0812-3456-7890</p>
          </div>

          {/* Transaction Metadata */}
          <div className="py-3 border-b border-dashed border-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">No. Struk:</span>
              <span className="font-bold text-slate-200">{transaction.transactionNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Waktu:</span>
              <span className="text-slate-300">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Kasir:</span>
              <span className="text-slate-300">{transaction.cashierName || 'Kasir Utama'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Metode:</span>
              <span className="font-bold text-indigo-400">{PaymentMethodNames[transaction.paymentMethod]}</span>
            </div>
          </div>

          {/* Items List */}
          <div className="py-3 border-b border-dashed border-slate-700 space-y-2">
            {transaction.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-bold text-slate-200">{item.productNameSnapshot}</div>
                <div className="flex justify-between text-slate-400">
                  <span>{item.qty} x {formatRupiah(item.priceSnapshot)}</span>
                  <span className="font-bold text-slate-200">{formatRupiah(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          <div className="py-3 space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Total Tagihan:</span>
              <span className="font-extrabold text-sm text-white">{formatRupiah(transaction.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Bayar:</span>
              <span>{formatRupiah(transaction.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Kembalian:</span>
              <span>{formatRupiah(transaction.changeAmount)}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4 border-t border-dashed border-slate-700 space-y-1">
            <p className="text-[11px] font-semibold text-slate-400">*** TERIMA KASIH ***</p>
            <p className="text-[10px] text-slate-500">Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
            <p className="text-[9px] text-indigo-400/80 pt-1">Powered by PosApi .NET 8 System</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Struk</span>
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
