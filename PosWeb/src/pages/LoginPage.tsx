import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Store, Lock, User, KeyRound, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('kasir1');
  const [password, setPassword] = useState('kasir123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await api.login(username, password);
      login(userData);
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kembali username & password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Dynamic Background Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 mb-4 animate-bounce">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Kasir<span className="text-indigo-400">POS</span> System</h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Masuk untuk memulai sesi kasir / manajemen toko</p>
        </div>

        {/* Login Glass Card */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl border border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold animate-fade-in">
                {error}
              </div>
            )}

            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Masuk Sesi POS</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Helper */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Preset Akun Demo Seed .NET
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('kasir1', 'kasir123')}
                className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 mb-0.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Role Kasir</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">kasir1 / kasir123</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('owner', 'owner123')}
                className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Role Owner</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">owner / owner123</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
