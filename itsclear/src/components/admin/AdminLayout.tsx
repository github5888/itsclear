import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { BrandName } from '../common/BrandName';
import {
  LayoutDashboard,
  Layers,
  Package,
  Boxes,
  Truck,
  FileText,
  Sparkles,
  Tag,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ShieldCheck,
  ChevronRight,
  User,
  AlertTriangle,
  Users,
  BarChart3
} from 'lucide-react';

export type AdminModuleTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'grain-club'
  | 'coupons'
  | 'content'
  | 'reports'
  | 'settings';

interface AdminLayoutProps {
  currentModule: AdminModuleTab;
  onSelectModule: (module: AdminModuleTab) => void;
  onReturnToHome: () => void;
  lowStockCount?: number;
  children: React.ReactNode;
}

interface NavItem {
  id: AdminModuleTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
  description: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentModule,
  onSelectModule,
  onReturnToHome,
  lowStockCount = 0,
  children
}) => {
  const { logoutAdmin } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Sales, metrics & alerts'
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      description: 'Multi-category catalog'
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Layers,
      description: 'Atta, Oil, Ghee & custom'
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
      description: 'SKU stock & audit ledger'
    },
    {
      id: 'orders',
      label: 'Orders & Dispatch',
      icon: Truck,
      description: 'Fulfillment & pilot delivery'
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      description: 'Profiles, orders & coins'
    },
    {
      id: 'grain-club',
      label: 'Grain Club',
      icon: Sparkles,
      description: 'Subscriptions & loyalty coins'
    },
    {
      id: 'coupons',
      label: 'Offers & Coupons',
      icon: Tag,
      description: 'Promotions & anti-stacking'
    },
    {
      id: 'content',
      label: 'Website Content',
      icon: FileText,
      description: 'Banners, sections & SEO'
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      description: 'Revenue, trends & health'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Delivery, gateway & staff'
    }
  ];

  const currentNav = navItems.find(n => n.id === currentModule);

  const handleLogout = () => {
    logoutAdmin();
    onReturnToHome();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP APP BAR
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left: Mobile trigger & Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 leading-none">
                <span className="font-black text-slate-950 tracking-tight text-base sm:text-lg">
                  its<span className="text-orange-500">clear</span>™
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-900 text-amber-400">
                  Admin 2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Operations &amp; Multi-Category Food Console
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right: Live View Store & Quick Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={onReturnToHome}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors border border-slate-200/60"
            title="Open customer website"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">View Customer Store</span>
            <span className="sm:hidden">Store</span>
          </button>

          {lowStockCount > 0 && (
            <button
              onClick={() => onSelectModule('inventory')}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>{lowStockCount} Low Stock</span>
            </button>
          )}

          <div className="h-5 w-px bg-slate-200" />

          {/* Admin User & Logout */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">
              A
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN BODY: SIDEBAR + CONTENT OUTLET
      ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200/80 flex-col justify-between hidden lg:flex shrink-0">
          <div className="p-4 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Management Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left group ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <div className="truncate">
                      <div className="truncate leading-tight">{item.label}</div>
                      <div
                        className={`text-[10px] font-normal truncate ${
                          isActive ? 'text-slate-400' : 'text-slate-400'
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`ml-2 px-1.5 py-0.5 text-[10px] font-black rounded-full ${
                        item.badgeColor || 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Sidebar Info */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center space-x-2 text-xs font-black text-slate-900">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Store Engine Active</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                MongoDB connected. All 4 natural food categories online.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-Over Drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-72 max-w-[85vw] h-full bg-white shadow-2xl p-4 flex flex-col justify-between"
              onClick={e => e.stopPropagation()}
            >
              <div className="space-y-2 overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Admin Navigation
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1 pt-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentModule === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectModule(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                          isActive
                            ? 'bg-slate-950 text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${item.badgeColor || 'bg-slate-200'}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {/* Breadcrumb strip */}
          <div className="bg-white/70 border-b border-slate-200/60 px-4 sm:px-8 lg:px-12 py-2.5 flex items-center space-x-2 text-xs font-medium text-slate-500">
            <span className="hover:text-slate-900 cursor-pointer" onClick={() => onSelectModule('dashboard')}>
              Admin
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-bold text-slate-900">{currentNav?.label}</span>
          </div>

          {/* Module Component Container */}
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
