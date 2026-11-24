import React, { useState, useEffect, useCallback } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Footer } from './components/layout/Footer';
import { NotificationToast } from './components/layout/NotificationToast';
import { CartDrawer } from './components/cart/CartDrawer';
import { AuthModal } from './components/auth/AuthModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { PurityLabPage } from './pages/PurityLabPage';
import { OurStoryPage } from './pages/OurStoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminLoginGate } from './components/admin/AdminLoginGate';
import { TermsPage } from './pages/legal/TermsPage';
import { PrivacyPolicyPage } from './pages/legal/PrivacyPolicyPage';
import { RefundPolicyPage } from './pages/legal/RefundPolicyPage';
import { ShippingPolicyPage } from './pages/legal/ShippingPolicyPage';
import { ContactPage } from './pages/ContactPage';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';

function parseLocation(): { tab: string; productId?: string; orderId?: string; query?: string; category?: string } {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  const category = params.get('category') || '';

  if (path === '/' || path === '/home') return { tab: 'home' };
  if (path === '/shop') return { tab: 'shop', query: q, category };
  if (path.startsWith('/product/')) {
    return { tab: 'product-detail', productId: decodeURIComponent(path.slice('/product/'.length)) };
  }
  if (path === '/cart') return { tab: 'cart' };
  if (path === '/checkout') return { tab: 'checkout' };
  if (path === '/orders') return { tab: 'orders' };
  if (path.startsWith('/track/')) {
    return { tab: 'order-tracking', orderId: decodeURIComponent(path.slice('/track/'.length)) };
  }
  if (path === '/order-tracking') return { tab: 'order-tracking', orderId: params.get('orderId') || undefined };
  if (path === '/our-story') return { tab: 'our-story' };
  if (path === '/purity-lab') return { tab: 'our-story' }; // Redirect deprecated Purity Lab
  if (path === '/profile') return { tab: 'profile' };
  if (path === '/wishlist') return { tab: 'wishlist' };
  if (path === '/terms') return { tab: 'terms' };
  if (path === '/privacy') return { tab: 'privacy' };
  if (path === '/refund-policy') return { tab: 'refund-policy' };
  if (path === '/shipping-policy') return { tab: 'shipping-policy' };
  if (path === '/contact') return { tab: 'contact' };
  if (path === '/admin') return { tab: 'admin' };
  if (path === '/admin/categories') return { tab: 'admin-categories' };
  if (path === '/admin/products') return { tab: 'admin-products' };
  if (path === '/admin/inventory') return { tab: 'admin-inventory' };
  if (path === '/admin/orders') return { tab: 'admin-orders' };
  if (path === '/admin/content') return { tab: 'admin-content' };
  if (path === '/admin/grain-club') return { tab: 'admin-grain-club' };
  if (path === '/admin/coupons') return { tab: 'admin-coupons' };
  if (path === '/admin/settings') return { tab: 'admin-settings' };
  return { tab: 'home' };
}

function buildUrlForTab(tab: string, opts?: { productId?: string; orderId?: string; query?: string }): string {
  switch (tab) {
    case 'home': return '/';
    case 'shop': return opts?.query ? `/shop?q=${encodeURIComponent(opts.query)}` : '/shop';
    case 'product-detail': return `/product/${encodeURIComponent(opts?.productId || 'itsclear-khapli-ancient')}`;
    case 'cart': return '/cart';
    case 'checkout': return '/checkout';
    case 'orders': return '/orders';
    case 'order-tracking': return opts?.orderId ? `/track/${encodeURIComponent(opts.orderId)}` : '/order-tracking';
    case 'our-story': return '/our-story';
    case 'purity-lab': return '/our-story';
    case 'profile': return '/profile';
    case 'wishlist': return '/wishlist';
    case 'terms': return '/terms';
    case 'privacy': return '/privacy';
    case 'refund-policy': return '/refund-policy';
    case 'shipping-policy': return '/shipping-policy';
    case 'contact': return '/contact';
    case 'admin': return '/admin';
    case 'admin-categories': return '/admin/categories';
    case 'admin-products': return '/admin/products';
    case 'admin-inventory': return '/admin/inventory';
    case 'admin-orders': return '/admin/orders';
    case 'admin-content': return '/admin/content';
    case 'admin-grain-club': return '/admin/grain-club';
    case 'admin-coupons': return '/admin/coupons';
    case 'admin-settings': return '/admin/settings';
    default: return '/';
  }
}

export function AppContent() {
  const initial = parseLocation();
  const [currentTab, setCurrentTabState] = useState<string>(initial.tab);
  const [selectedProductId, setSelectedProductId] = useState<string>(initial.productId || 'itsclear-khapli-ancient');
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | undefined>(initial.orderId);
  const [searchQuery, setSearchQuery] = useState<string>(initial.query || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(initial.category || 'all');

  const navigateTo = useCallback((tab: string, opts?: { productId?: string; orderId?: string; query?: string; category?: string }) => {
    if (opts?.productId) setSelectedProductId(opts.productId);
    if (opts?.orderId !== undefined) setActiveTrackingOrderId(opts.orderId);
    if (opts?.query !== undefined) setSearchQuery(opts.query);
    if (opts?.category !== undefined) setSelectedCategory(opts.category);
    setCurrentTabState(tab);

    const nextUrl = buildUrlForTab(tab, {
      productId: opts?.productId || selectedProductId,
      orderId: opts?.orderId !== undefined ? opts.orderId : activeTrackingOrderId,
      query: opts?.query !== undefined ? opts.query : (tab === 'shop' ? searchQuery : undefined)
    });
    if (window.location.pathname + window.location.search !== nextUrl) {
      window.history.pushState({ tab, ...opts }, '', nextUrl);
    }
  }, [selectedProductId, activeTrackingOrderId, searchQuery]);

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseLocation();
      setCurrentTabState(parsed.tab);
      if (parsed.productId) setSelectedProductId(parsed.productId);
      setActiveTrackingOrderId(parsed.orderId);
      if (parsed.query !== undefined) setSearchQuery(parsed.query);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab, selectedProductId]);

  const setCurrentTab = (tab: string) => {
    navigateTo(tab);
  };

  const handleSelectProduct = (productId: string) => {
    navigateTo('product-detail', { productId });
  };

  const handleOrderSuccess = (orderId: string) => {
    navigateTo('order-tracking', { orderId });
  };

  const handleTrackSpecificOrder = (orderId: string) => {
    navigateTo('order-tracking', { orderId });
  };

  const handleGlobalSearch = (query: string) => {
    navigateTo('shop', { query });
  };

  const isAdminView = currentTab.startsWith('admin');

  return (
    <div className="min-h-screen bg-[#faf9f5] text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 w-full overflow-x-hidden">
      {/* Toast Notification Container */}
      <NotificationToast />

      {/* Main Navigation Bar (Hidden when inside Admin SaaS console) */}
      {!isAdminView && (
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onSearch={handleGlobalSearch}
          onSelectProduct={handleSelectProduct}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setCurrentTab('shop');
          }}
        />
      )}

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        onNavigateToCheckout={() => setCurrentTab('checkout')}
        onNavigateToShop={() => setCurrentTab('shop')}
      />

      {/* Customer Login / Registration Modal */}
      <AuthModal />

      {/* Main Page Switcher */}
      <main className="flex-1 pb-20 lg:pb-0">
        {currentTab === 'home' && (
          <HomePage
            setCurrentTab={setCurrentTab}
            onSelectProduct={handleSelectProduct}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setCurrentTab('shop');
            }}
          />
        )}

        {currentTab === 'shop' && (
          <ShopPage
            onSelectProduct={handleSelectProduct}
            initialSearchQuery={searchQuery}
            initialCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onBackToHome={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'product-detail' && (
          <ProductDetailPage
            productId={selectedProductId}
            onBack={() => setCurrentTab('shop')}
            onSelectProduct={handleSelectProduct}
            onNavigateToCheckout={() => setCurrentTab('checkout')}
          />
        )}

        {currentTab === 'cart' && (
          <CartPage
            onNavigateToCheckout={() => setCurrentTab('checkout')}
            onNavigateToShop={() => setCurrentTab('shop')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentTab === 'checkout' && (
          <CheckoutPage
            onOrderSuccess={handleOrderSuccess}
            onBackToCart={() => setCurrentTab('cart')}
          />
        )}

        {currentTab === 'order-tracking' && (
          <OrderTrackingPage
            orderId={activeTrackingOrderId}
            onNavigateToShop={() => setCurrentTab('shop')}
            onNavigateToOrders={() => setCurrentTab('orders')}
          />
        )}

        {currentTab === 'orders' && (
          <OrderHistoryPage
            onTrackOrder={handleTrackSpecificOrder}
            onNavigateToShop={() => setCurrentTab('shop')}
          />
        )}

        {(currentTab === 'our-story' || currentTab === 'purity-lab') && (
          <OurStoryPage
            onExploreShop={(cat) => {
              if (cat) setSelectedCategory(cat);
              setCurrentTab('shop');
            }}
          />
        )}

        {currentTab === 'profile' && (
          <ProfilePage
            initialTab="subscriptions"
            onSelectProduct={handleSelectProduct}
            onNavigateToShop={() => setCurrentTab('shop')}
          />
        )}

        {currentTab === 'wishlist' && (
          <ProfilePage
            initialTab="wishlist"
            onSelectProduct={handleSelectProduct}
            onNavigateToShop={() => setCurrentTab('shop')}
          />
        )}

        {isAdminView && (
          <AdminLoginGate onReturnToHome={() => setCurrentTab('home')}>
            <AdminDashboardPage
              initialModule={
                currentTab === 'admin-categories' ? 'categories' :
                currentTab === 'admin-products' ? 'products' :
                currentTab === 'admin-inventory' ? 'inventory' :
                currentTab === 'admin-orders' ? 'orders' :
                currentTab === 'admin-content' ? 'content' :
                currentTab === 'admin-grain-club' ? 'grain-club' :
                currentTab === 'admin-coupons' ? 'coupons' :
                currentTab === 'admin-settings' ? 'settings' :
                'dashboard'
              }
              onNavigateToTab={(tab) => setCurrentTab(tab)}
              onTrackOrder={handleTrackSpecificOrder}
              onSelectProduct={handleSelectProduct}
            />
          </AdminLoginGate>
        )}
        {currentTab === 'terms' && <TermsPage onBack={() => setCurrentTab('home')} />}
        {currentTab === 'privacy' && <PrivacyPolicyPage onBack={() => setCurrentTab('home')} />}
        {currentTab === 'refund-policy' && <RefundPolicyPage onBack={() => setCurrentTab('home')} />}
        {currentTab === 'shipping-policy' && <ShippingPolicyPage onBack={() => setCurrentTab('home')} />}
        {currentTab === 'contact' && <ContactPage onBack={() => setCurrentTab('home')} />}
      </main>

      {/* Global Customer Footer, WhatsApp & Mobile Nav (Hidden in Admin Mode) */}
      {!isAdminView && (
        <>
          <Footer setCurrentTab={setCurrentTab} />
          <WhatsAppFloatingButton />
          <MobileBottomNav
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />
        </>
      )}
    </div>
  );
}

export function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;
