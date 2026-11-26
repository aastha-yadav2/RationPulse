import React, { useMemo, useState } from 'react';
import { ArrowUpDown, CalendarClock, Info } from 'lucide-react';
import {
  Commodity,
  CommodityForecast,
  FairPriceShop,
  RiskLevel,
} from '../types';
import { forecastingEngine } from '../services/forecasting';
import { DemoDataBadge, RiskBadge } from '../components/Badge';

interface ShortagePredictionProps {
  shops: FairPriceShop[];
  searchQuery: string;
  onSelectShop: (shop: FairPriceShop) => void;
}

type SortKey = 'daysRemaining' | 'currentStockKg' | 'avgDailyDemandKg' | 'risk';

const RISK_ORDER: Record<RiskLevel, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export const ShortagePrediction: React.FC<ShortagePredictionProps> = ({
  shops,
  searchQuery,
  onSelectShop,
}) => {
  const [commodityFilter, setCommodityFilter] = useState<'all' | Commodity>(
    'all'
  );
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('daysRemaining');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const districts = useMemo(
    () => Array.from(new Set(shops.map((s) => s.district))),
    [shops]
  );

  const allForecasts = useMemo(() => {
    const rows: CommodityForecast[] = [];
    for (const shop of shops) {
      rows.push(forecastingEngine.forecastShopCommodity(shop, 'rice'));
      rows.push(forecastingEngine.forecastShopCommodity(shop, 'wheat'));
    }
    return rows;
  }, [shops]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allForecasts
      .filter((row) => {
        if (commodityFilter !== 'all' && row.commodity !== commodityFilter)
          return false;
        if (riskFilter !== 'all' && row.riskLevel !== riskFilter) return false;
        if (districtFilter !== 'all' && row.district !== districtFilter)
          return false;
        if (
          q &&
          !row.shopId.toLowerCase().includes(q) &&
          !row.shopName.toLowerCase().includes(q) &&
          !row.district.toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortKey === 'daysRemaining') {
          diff = a.daysRemaining - b.daysRemaining;
        } else if (sortKey === 'currentStockKg') {
          diff = a.currentStockKg - b.currentStockKg;
        } else if (sortKey === 'avgDailyDemandKg') {
          diff = a.avgDailyDemandKg - b.avgDailyDemandKg;
        } else if (sortKey === 'risk') {
          diff = RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel];
        }
        return sortAsc ? diff : -diff;
      });
  }, [
    allForecasts,
    commodityFilter,
    riskFilter,
    districtFilter,
    searchQuery,
    sortKey,
    sortAsc,
  ]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-[#1A241E]">
              Shortage Prediction
            </h2>
            <DemoDataBadge />
          </div>
          <p className="text-sm text-[#526058] mt-1">
            Commodity-level stockout horizon compared against replenishment lead
            times.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F2F7F4] border border-[#D3DFD5] text-xs font-semibold text-[#1B4332] self-start">
          <CalendarClock className="w-4 h-4 text-[#2D6A4F]" />
          {forecastingEngine.modeLabel}
        </span>
      </div>

      {/* Transparency & Formula Strip */}
      <div className="bg-white rounded-xl px-4 py-3 border border-[#E5E2DC] flex items-start gap-3 text-xs text-[#526058]">
        <Info className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
        <p>
          <strong className="text-[#1A241E]">Forecasting Logic:</strong>{' '}
          <code className="font-mono-num bg-[#F1EFEA] px-1.5 py-0.5 rounded text-[#1B4332]">
            Days Remaining = Current Stock ÷ Avg Daily Consumption
          </code>
          . Shops whose coverage falls below their expected replenishment window
          are flagged as <strong>High</strong> or <strong>Critical</strong>{' '}
          shortage risk.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E2DC] shadow-card flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 bg-[#F8F7F4] p-1 rounded-xl border border-[#E5E2DC]">
          {(['all', 'rice', 'wheat'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCommodityFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                commodityFilter === c
                  ? 'bg-[#1B4332] text-white'
                  : 'text-[#526058] hover:text-[#1A241E]'
              }`}
            >
              {c === 'all' ? 'All Commodities' : c}
            </button>
          ))}
        </div>

        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value as 'all' | RiskLevel)}
          className="px-3 py-2 rounded-xl border border-[#E5E2DC] bg-[#F8F7F4] text-xs font-semibold text-[#1A241E] focus:outline-none focus:border-[#2D6A4F]"
          aria-label="Filter by risk level"
        >
          <option value="all">All Risk Levels</option>
          <option value="Critical">Critical Risk</option>
          <option value="High">High Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="Low">Low Risk</option>
        </select>

        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[#E5E2DC] bg-[#F8F7F4] text-xs font-semibold text-[#1A241E] focus:outline-none focus:border-[#2D6A4F]"
          aria-label="Filter by district"
        >
          <option value="all">All Districts</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <span className="ml-auto text-xs text-[#526058] font-medium">
          Showing{' '}
          <strong className="font-mono-num text-[#1A241E]">
            {filtered.length}
          </strong>{' '}
          forecasts
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E2DC] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E2DC] bg-[#F8F7F4] text-[11px] font-semibold uppercase tracking-wider text-[#526058]">
                <th className="py-3.5 px-4">Shop</th>
                <th className="py-3.5 px-4">Commodity</th>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => handleSort('currentStockKg')}
                    className="inline-flex items-center gap-1 hover:text-[#1A241E]"
                  >
                    Current Stock
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => handleSort('avgDailyDemandKg')}
                    className="inline-flex items-center gap-1 hover:text-[#1A241E]"
                  >
                    Avg Daily Demand
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => handleSort('daysRemaining')}
                    className="inline-flex items-center gap-1 hover:text-[#1A241E]"
                  >
                    Est. Days Remaining
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">Next Delivery</th>
                <th className="py-3.5 px-4">Predicted Shortage</th>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => handleSort('risk')}
                    className="inline-flex items-center gap-1 hover:text-[#1A241E]"
                  >
                    Risk
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EFEA] text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center text-sm text-[#526058]"
                  >
                    No forecasts match the active filters.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const isShortage =
                    row.daysRemaining < row.expectedReplenishmentDays;
                  return (
                    <tr
                      key={`${row.shopId}-${row.commodity}`}
                      onClick={() => {
                        const found = shops.find((s) => s.id === row.shopId);
                        if (found) onSelectShop(found);
                      }}
                      className="hover:bg-[#F6F8F6] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-num text-xs font-bold px-2 py-0.5 rounded bg-[#F1EFEA] text-[#1B4332]">
                            {row.shopId}
                          </span>
                          <div>
                            <p className="font-semibold text-[#1A241E] text-xs sm:text-sm">
                              {row.shopName}
                            </p>
                            <p className="text-[11px] text-[#526058]">
                              {row.district}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize font-medium text-xs px-2.5 py-1 rounded-lg bg-[#F2F7F4] text-[#1B4332]">
                          {row.commodity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono-num font-semibold text-[#1A241E]">
                        {row.currentStockKg} kg
                      </td>
                      <td className="py-3.5 px-4 font-mono-num text-[#526058]">
                        {row.avgDailyDemandKg} kg/day
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono-num font-bold ${
                              isShortage ? 'text-[#B42318]' : 'text-[#1E6B3A]'
                            }`}
                          >
                            {row.daysRemaining}d
                          </span>
                          <span className="text-[11px] text-[#6B7A70]">
                            (lead: {row.expectedReplenishmentDays}d)
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono-num text-xs text-[#1A241E]">
                        <div>{row.nextDeliveryDate}</div>
                        {row.deliveryDelayed && (
                          <span className="text-[10px] font-semibold text-[#B44312]">
                            Delayed
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono-num text-xs">
                        {row.predictedShortageDate ? (
                          <span className="font-semibold text-[#B42318]">
                            {row.predictedShortageDate}
                          </span>
                        ) : (
                          <span className="text-[#52796F]">No stockout</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={row.riskLevel} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
