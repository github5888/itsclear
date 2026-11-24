import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { AdminLayout, AdminModuleTab } from '../../components/admin/AdminLayout';
import { AdminOverviewView } from './views/AdminOverviewView';
import { AdminCategoriesView } from './views/AdminCategoriesView';
import { AdminProductsView } from './views/AdminProductsView';
import { AdminInventoryView } from './views/AdminInventoryView';
import { AdminOrdersView } from './views/AdminOrdersView';
import { AdminContentView } from './views/AdminContentView';
import { AdminGrainClubView } from './views/AdminGrainClubView';
import { AdminCouponsView } from './views/AdminCouponsView';
import { AdminSettingsView } from './views/AdminSettingsView';
import { AdminCustomersView } from './views/AdminCustomersView';
import { AdminReportsView } from './views/AdminReportsView';

interface AdminDashboardPageProps {
  initialModule?: AdminModuleTab;
  onNavigateToTab: (tab: string) => void;
  onTrackOrder?: (orderId: string) => void;
  onSelectProduct?: (productId: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  initialModule = 'dashboard',
  onNavigateToTab,
  onTrackOrder,
  onSelectProduct
}) => {
  const { products } = useStore();
  const [currentModule, setCurrentModule] = useState<AdminModuleTab>(initialModule);

  useEffect(() => {
    if (initialModule) {
      setCurrentModule(initialModule);
    }
  }, [initialModule]);

  // Calculate global low-stock count for sidebar badge
  let lowStockCount = 0;
  products.forEach(p => {
    p.variants?.forEach(v => {
      if (Number(v.stockCount || 0) <= Number(v.lowStockThreshold || 20)) {
        lowStockCount++;
      }
    });
  });

  return (
    <AdminLayout
      currentModule={currentModule}
      onSelectModule={setCurrentModule}
      onReturnToHome={() => onNavigateToTab('home')}
      lowStockCount={lowStockCount}
    >
      {currentModule === 'dashboard' && (
        <AdminOverviewView
          onNavigate={setCurrentModule}
          onTrackOrder={onTrackOrder}
          onSelectProduct={onSelectProduct}
        />
      )}

      {currentModule === 'categories' && (
        <AdminCategoriesView />
      )}

      {currentModule === 'products' && (
        <AdminProductsView
          onSelectProduct={onSelectProduct}
        />
      )}

      {currentModule === 'inventory' && (
        <AdminInventoryView />
      )}

      {currentModule === 'orders' && (
        <AdminOrdersView
          onTrackOrder={onTrackOrder}
        />
      )}

      {currentModule === 'customers' && (
        <AdminCustomersView />
      )}

      {currentModule === 'content' && (
        <AdminContentView />
      )}

      {currentModule === 'reports' && (
        <AdminReportsView />
      )}

      {currentModule === 'grain-club' && (
        <AdminGrainClubView />
      )}

      {currentModule === 'coupons' && (
        <AdminCouponsView />
      )}

      {currentModule === 'settings' && (
        <AdminSettingsView />
      )}
    </AdminLayout>
  );
};
