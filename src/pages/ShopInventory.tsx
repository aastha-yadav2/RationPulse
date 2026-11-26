import React, { useMemo, useState } from 'react';
import { ChevronRight, MapPin } from 'lucide-react';
import { FairPriceShop } from '../types';
import {
  getShopMinCoverageDays,
  getShopOverallRisk,
} from '../services/forecasting';
import { DemoDataBadge, RiskBadge } from '../components/Badge';

interface ShopInventoryProps {
  shops: FairPriceShop[];
  searchQuery: string;
  onSelectShop: (shop: FairPriceShop) => void;
}

export const ShopInventory: React.FC<ShopInventoryProps> = ({
  shops,
  searchQuery,
  onSelectShop,
}) => {
  const [districtFilter, setDistrictFilter] = useState<string>('all');

  const districts = useMemo(
    () => Array.from(new Set(shops.map((s) => s.district))),
    [shops]
  );

  const filteredShops = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return shops.filter((shop) => {
      if (districtFilter !== 'all' && shop.district !== districtFilter) {
        return false;
      }
      if (
        q &&
        !shop.id.toLowerCase().includes(q) &&
        !shop.name.toLowerCase().includes(q) &&
        !shop.district.toLowerCase().includes(q) &&
        !shop.block.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [shops, districtFilter, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-[#1A241E]">
              Shop Inventory
            </h2>
            <DemoDataBadge />
          </div>
          <p className="text-sm text-[#526058] mt-1">
            Click any Fair Price Shop row to inspect commodity coverage,
            replenishment dates, and transfer readiness.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#E5E2DC] bg-white text-xs font-semibold text-[#1A241E] focus:outline-none focus:border-[#2D6A4F]"
            aria-label="Filter shops by district"
          >
            <option value="all">All Districts ({shops.length})</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E2DC] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E2DC] bg-[#F8F7F4] text-[11px] font-semibold uppercase tracking-wider text-[#526058]">
                <th className="py-3.5 px-4">Shop ID</th>
                <th className="py-3.5 px-4">Shop Name</th>
                <th className="py-3.5 px-4">District / Area</th>
                <th className="py-3.5 px-4">Rice Stock</th>
                <th className="py-3.5 px-4">Wheat Stock</th>
                <th className="py-3.5 px-4">Daily Demand</th>
                <th className="py-3.5 px-4">Min Coverage</th>
                <th className="py-3.5 px-4">Risk Status</th>
                <th className="py-3.5 px-4 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1EFEA] text-sm">
              {filteredShops.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-10 text-center text-sm text-[#526058]"
                  >
                    No Fair Price Shops match your search.
                  </td>
                </tr>
              ) : (
                filteredShops.map((shop) => {
                  const risk = getShopOverallRisk(shop);
                  const minCoverage = getShopMinCoverageDays(shop);
                  const totalDemand =
                    shop.rice.avgDailyDemandKg + shop.wheat.avgDailyDemandKg;

                  return (
                    <tr
                      key={shop.id}
                      onClick={() => onSelectShop(shop)}
                      className="hover:bg-[#F2F7F4]/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono-num text-xs font-bold px-2.5 py-1 rounded-lg bg-[#F1EFEA] text-[#1B4332]">
                          {shop.id}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#1A241E]">
                          {shop.name}
                        </p>
                        <p className="text-[11px] text-[#526058]">
                          Dealer: {shop.dealerName}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-xs font-medium text-[#1A241E] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#52796F]" />
                          {shop.district}
                        </p>
                        <p className="text-[11px] text-[#526058] pl-4">
                          {shop.block} Block
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-mono-num font-semibold text-[#1A241E]">
                        {shop.rice.currentStockKg} kg
                      </td>
                      <td className="py-3.5 px-4 font-mono-num font-semibold text-[#1A241E]">
                        {shop.wheat.currentStockKg} kg
                      </td>
                      <td className="py-3.5 px-4 font-mono-num text-xs text-[#526058]">
                        {totalDemand} kg/day
                        <span className="block text-[10px] text-[#7D8A82]">
                          ({shop.rice.avgDailyDemandKg}R /{' '}
                          {shop.wheat.avgDailyDemandKg}W)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono-num font-bold text-[#1B4332]">
                        {minCoverage} days
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={risk} />
                      </td>
                      <td className="py-3.5 px-4 text-[#7D8A82] group-hover:text-[#1B4332]">
                        <ChevronRight className="w-4 h-4" />
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
