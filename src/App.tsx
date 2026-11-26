import { useCallback, useMemo, useState } from 'react';
import {
  INITIAL_ALERTS,
  INITIAL_RECOMMENDATIONS,
  INITIAL_SHOPS,
} from './data/demoData';
import { forecastingEngine } from './services/forecasting';
import {
  FairPriceShop,
  PageId,
  RedistributionRecommendation,
  SystemAlert,
  ToastMessage,
} from './types';
import { Layout } from './components/Layout';
import { ShopDetailDrawer } from './components/ShopDetailDrawer';
import { ToastContainer } from './components/ToastContainer';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { ShortagePrediction } from './pages/ShortagePrediction';
import { ShopInventory } from './pages/ShopInventory';
import { SmartRedistribution } from './pages/SmartRedistribution';
import { AlertsPage } from './pages/AlertsPage';

export function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const [shops, setShops] = useState<FairPriceShop[]>(() =>
    structuredClone(INITIAL_SHOPS)
  );
  const [recommendations, setRecommendations] = useState<
    RedistributionRecommendation[]
  >(() => structuredClone(INITIAL_RECOMMENDATIONS));
  const [alerts, setAlerts] = useState<SystemAlert[]>(() =>
    structuredClone(INITIAL_ALERTS)
  );

  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (
      type: ToastMessage['type'],
      title: string,
      description?: string
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, description }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const selectedShop = useMemo(
    () => shops.find((s) => s.id === selectedShopId) ?? null,
    [shops, selectedShopId]
  );

  const unreadAlertsCount = useMemo(
    () => alerts.filter((a) => !a.acknowledged).length,
    [alerts]
  );

  const pendingRecsCount = useMemo(
    () => recommendations.filter((r) => r.status === 'Pending Approval').length,
    [recommendations]
  );

  const handleGenerateRecommendations = () => {
    const generated = forecastingEngine.generateRedistributions(
      shops,
      recommendations
    );

    if (generated.length === 0) {
      addToast(
        'info',
        'No new safe transfers needed',
        'All feasible surplus-to-deficit pairings already have active recommendations or no donor has safe surplus.'
      );
      return;
    }

    setRecommendations((prev) => [...generated, ...prev]);
    addToast(
      'success',
      `${generated.length} new recommendation${generated.length > 1 ? 's' : ''} generated`,
      'Verified against donor projected demand and 2-day safety stock buffer.'
    );
  };

  const handleApproveRecommendation = (recId: string) => {
    const target = recommendations.find((r) => r.id === recId);
    if (!target || target.status !== 'Pending Approval') return;

    const commodity = target.commodity;
    const sourceShop = shops.find((s) => s.id === target.sourceShopId);
    if (!sourceShop) return;

    const sourceForecast = forecastingEngine.forecastShopCommodity(
      sourceShop,
      commodity
    );
    if (sourceForecast.transferableSurplusKg < target.recommendedQtyKg) {
      addToast(
        'error',
        `Transfer blocked for ${target.id}`,
        `${target.sourceShopId} only has ${sourceForecast.transferableSurplusKg} kg safe surplus remaining, below the ${target.recommendedQtyKg} kg transfer.`
      );
      return;
    }

    // Update shop stock balances
    setShops((prevShops) =>
      prevShops.map((shop) => {
        if (shop.id === target.sourceShopId) {
          return {
            ...shop,
            [commodity]: {
              ...shop[commodity],
              currentStockKg: Math.max(
                0,
                shop[commodity].currentStockKg - target.recommendedQtyKg
              ),
            },
            lastUpdated: 'Just now (Transfer Approved)',
          };
        }
        if (shop.id === target.destinationShopId) {
          return {
            ...shop,
            [commodity]: {
              ...shop[commodity],
              currentStockKg:
                shop[commodity].currentStockKg + target.recommendedQtyKg,
            },
            lastUpdated: 'Just now (Transfer Approved)',
          };
        }
        return shop;
      })
    );

    // Mark recommendation approved
    setRecommendations((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, status: 'Approved' } : r))
    );

    // Acknowledge related shortage alert if any
    setAlerts((prev) =>
      prev.map((a) =>
        a.shopId === target.destinationShopId && a.commodity === commodity
          ? { ...a, acknowledged: true }
          : a
      )
    );

    addToast(
      'success',
      `Approved: ${target.recommendedQtyKg} kg ${commodity} transfer`,
      `${target.sourceShopId} → ${target.destinationShopId}. Inventory and coverage forecasts updated.`
    );
  };

  const handleRejectRecommendation = (recId: string) => {
    const target = recommendations.find((r) => r.id === recId);
    if (!target || target.status !== 'Pending Approval') return;

    setRecommendations((prev) =>
      prev.map((r) => (r.id === recId ? { ...r, status: 'Rejected' } : r))
    );

    addToast(
      'warning',
      `Rejected transfer ${target.id}`,
      `${target.sourceShopId} → ${target.destinationShopId} (${target.recommendedQtyKg} kg ${target.commodity}) was declined.`
    );
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
    addToast('info', 'Alert acknowledged', 'Marked as reviewed in log.');
  };

  const handleResetDemo = () => {
    setShops(structuredClone(INITIAL_SHOPS));
    setRecommendations(structuredClone(INITIAL_RECOMMENDATIONS));
    setAlerts(structuredClone(INITIAL_ALERTS));
    setSearchQuery('');
    addToast(
      'info',
      'Demo state restored',
      'All Fair Price Shop inventories and recommendations reset to initial seeded values.'
    );
  };

  return (
    <>
      <Layout
        activePage={activePage}
        onNavigate={setActivePage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        unreadAlertsCount={unreadAlertsCount}
        pendingRecsCount={pendingRecsCount}
        onResetDemo={handleResetDemo}
      >
        {activePage === 'overview' && (
          <OverviewDashboard
            shops={shops}
            recommendations={recommendations}
            alerts={alerts}
            onNavigate={setActivePage}
            onSelectShop={(shop) => setSelectedShopId(shop.id)}
          />
        )}

        {activePage === 'predictions' && (
          <ShortagePrediction
            shops={shops}
            searchQuery={searchQuery}
            onSelectShop={(shop) => setSelectedShopId(shop.id)}
          />
        )}

        {activePage === 'inventory' && (
          <ShopInventory
            shops={shops}
            searchQuery={searchQuery}
            onSelectShop={(shop) => setSelectedShopId(shop.id)}
          />
        )}

        {activePage === 'redistribution' && (
          <SmartRedistribution
            recommendations={recommendations}
            searchQuery={searchQuery}
            onGenerate={handleGenerateRecommendations}
            onApprove={handleApproveRecommendation}
            onReject={handleRejectRecommendation}
          />
        )}

        {activePage === 'alerts' && (
          <AlertsPage
            alerts={alerts}
            shops={shops}
            searchQuery={searchQuery}
            onAcknowledge={handleAcknowledgeAlert}
            onSelectShop={(shop) => setSelectedShopId(shop.id)}
            onNavigate={setActivePage}
          />
        )}
      </Layout>

      <ShopDetailDrawer
        shop={selectedShop}
        onClose={() => setSelectedShopId(null)}
        onNavigate={setActivePage}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

export default App;
