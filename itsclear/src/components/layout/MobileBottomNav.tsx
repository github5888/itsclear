import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Home,
  ShoppingBag,
  BookOpen,
  Package,
  Coins,
  Sparkles,
  LayoutGrid
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab
}) => {
  const { cartItemCount, cartTotal, setIsCartDrawerOpen } = useStore();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      action: () => setCurrentTab('home')
    },
    {
      id: 'shop',
      label: 'Shop All',
      icon: LayoutGrid,
      action: () => setCurrentTab('shop')
    },
    {
      id: 'our-story',
      label: 'Our Story',
      icon: BookOpen,
      action: () => setCurrentTab('our-story')
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: Package,
      action: () => setCurrentTab('orders')
    },
    {
      id: 'basket',
      label: 'Basket',
      icon: ShoppingBag,
      action: () => setIsCartDrawerOpen(true),
      isCart: true
    }
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:hidden select-none pb-[env(safe-area-inset-bottom)]"
    >
      <div className="w-full px-2 py-1 flex items-center justify-around h-14">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = !item.isCart && currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all transform active:scale-90 ${
                isActive
                  ? 'text-orange-600 font-black'
                  : 'text-slate-500 hover:text-slate-900 font-bold'
              }`}
            >
              {/* Active Tab Glow Pill (Top) */}
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-0.5 rounded-full bg-orange-500 animate-pulse-glow" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center w-6 h-6">
                <IconComponent
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-orange-600 stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />

                {/* Floating Real-Time Basket Counter Badge */}
                {item.isCart && cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow-xs animate-scale-up">
                    {cartItemCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-black text-orange-600' : 'font-semibold text-slate-600'}`}>
                {item.isCart && cartItemCount > 0 ? `₹${cartTotal}` : item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
