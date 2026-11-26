import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Truck,
} from 'lucide-react';
import {
  AlertCategory,
  AlertSeverity,
  FairPriceShop,
  PageId,
  SystemAlert,
} from '../types';
import { DemoDataBadge, SeverityBadge } from '../components/Badge';

interface AlertsPageProps {
  alerts: SystemAlert[];
  shops: FairPriceShop[];
  searchQuery: string;
  onAcknowledge: (id: string) => void;
  onSelectShop: (shop: FairPriceShop) => void;
  onNavigate: (page: PageId) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  shops,
  searchQuery,
  onAcknowledge,
  onSelectShop,
  onNavigate,
}) => {
  const [severityFilter, setSeverityFilter] = useState<'All' | AlertSeverity>(
    'All'
  );
  const [categoryFilter, setCategoryFilter] = useState<'All' | AlertCategory>(
    'All'
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return alerts.filter((a) => {
      if (severityFilter !== 'All' && a.severity !== severityFilter)
        return false;
      if (categoryFilter !== 'All' && a.category !== categoryFilter)
        return false;
      if (
        q &&
        !a.shopId.toLowerCase().includes(q) &&
        !a.shopName.toLowerCase().includes(q) &&
        !a.title.toLowerCase().includes(q) &&
        !a.district.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [alerts, severityFilter, categoryFilter, searchQuery]);

  const categoryIcon = (cat: AlertCategory) => {
    if (cat === 'Delivery Delay')
      return <Truck className="w-4 h-4 text-[#B44312]" />;
    if (cat === 'Shortage Risk')
      return <AlertTriangle className="w-4 h-4 text-[#DC2626]" />;
    return <Clock className="w-4 h-4 text-[#354F52]" />;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-[#1A241E]">
              Operational Alerts
            </h2>
            <DemoDataBadge />
          </div>
          <p className="text-sm text-[#526058] mt-1">
            High-risk stock depletion warnings, FCI dispatch delays, and
            transferable surplus notifications.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E2DC] shadow-card flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'Critical', 'High', 'Medium', 'Info'] as const).map(
            (sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                  severityFilter === sev
                    ? 'bg-[#1B4332] text-white border-[#1B4332]'
                    : 'bg-[#F8F7F4] text-[#526058] border-[#E5E2DC] hover:text-[#1A241E]'
                }`}
              >
                {sev}
              </button>
            )
          )}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value as 'All' | AlertCategory)
          }
          className="px-3 py-2 rounded-xl border border-[#E5E2DC] bg-[#F8F7F4] text-xs font-semibold text-[#1A241E] focus:outline-none focus:border-[#2D6A4F]"
          aria-label="Filter by alert category"
        >
          <option value="All">All Alert Types</option>
          <option value="Shortage Risk">Shortage Risk</option>
          <option value="Delivery Delay">Delivery Delay</option>
          <option value="Stock Imbalance">Stock Imbalance</option>
        </select>

        <span className="ml-auto text-xs text-[#526058]">
          Showing{' '}
          <strong className="font-mono-num text-[#1A241E]">
            {filtered.length}
          </strong>{' '}
          alerts
        </span>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-[#E5E2DC] text-center text-sm text-[#526058]">
            No alerts match the selected filters.
          </div>
        ) : (
          filtered.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                alert.acknowledged
                  ? 'border-[#E5E2DC] opacity-75'
                  : 'border-[#D3DFD5] shadow-card'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {categoryIcon(alert.category)}
                  <SeverityBadge severity={alert.severity} />
                  <span className="text-xs font-semibold text-[#526058]">
                    {alert.category}
                  </span>
                  <span className="text-[#D3DFD5]">•</span>
                  <span className="font-mono-num text-xs font-bold text-[#1B4332]">
                    {alert.shopId}
                  </span>
                  <span className="text-xs text-[#526058]">
                    {alert.shopName} ({alert.district})
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-[#1A241E]">
                  {alert.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#526058] leading-relaxed">
                  {alert.description}
                </p>
                <p className="text-[11px] font-mono-num text-[#7D8A82]">
                  {alert.timestamp}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    const found = shops.find((s) => s.id === alert.shopId);
                    if (found) onSelectShop(found);
                  }}
                  className="px-3 py-2 rounded-xl border border-[#E5E2DC] bg-[#F8F7F4] text-xs font-semibold text-[#1A241E] hover:border-[#2D6A4F] transition-colors"
                >
                  Inspect Shop
                </button>
                {alert.category === 'Shortage Risk' && (
                  <button
                    onClick={() => onNavigate('redistribution')}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#F2F7F4] text-xs font-semibold text-[#1B4332] hover:bg-[#D8F3DC] transition-colors"
                  >
                    Redistribute
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {!alert.acknowledged ? (
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#2D6A4F] transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Acknowledge
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#52796F]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Acknowledged
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
