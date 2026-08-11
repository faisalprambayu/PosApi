import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Package, BarChart3, RefreshCw } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { offlineQueue, totalItemsCount } = useCart();

  const navItems = [
    { id: 'pos', label: 'Kasir', icon: ShoppingBag, badge: totalItemsCount },
    { id: 'products', label: 'Produk', icon: Package },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'sync', label: 'Sync', icon: RefreshCw, badge: offlineQueue.length, badgeColor: 'bg-amber-500' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all relative ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && item.badge > 0 ? (
                  <span
                    className={`absolute -top-1.5 -right-2.5 px-1.5 py-0.2 text-[10px] font-extrabold text-slate-950 rounded-full ${
                      item.badgeColor || 'bg-indigo-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] tracking-tight">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-indigo-500 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
