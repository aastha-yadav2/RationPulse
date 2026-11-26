import React from 'react';
import {
  ArrowRightLeft,
  Calendar,
  MapPin,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';
import { Commodity, FairPriceShop, PageId } from '../types';
import {
  forecastingEngine,
  getShopOverallRisk,
  SAFETY_STOCK_DAYS,
} from '../services/forecasting';
import { DemoDataBadge, RiskBadge } from './Badge';

interface ShopDetailDrawerProps {
  shop: FairPriceShop | null;
  onClose: () => void;
  onNavigate: (page: PageId) => void;
}

export const ShopDetailDrawer: React.FC<ShopDetailDrawerProps> = ({
  shop,
  onClose,
  onNavigate,
}) => {
  if (!shop) return null;

  const overallRisk = getShopOverallRisk(shop);
  const commodities: Commodity[] = ['rice', 'wheat'];

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="fixed inset-0 bg-[#0F291E]/25 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />
      <aside className="relative z-50 w-full max-w-lg bg-[#F8F7F4] h-full shadow-2xl border-l border-[#E5E2DC] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white px-6 py-5 border-b border-[#E5E2DC] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono-num text-xs font-semibold px-2 py-0.5 rounded bg-[#F1EFEA] text-[#1B4332]">
                {shop.id}
              </span>
              <RiskBadge level={overallRisk} />
              <DemoDataBadge />
            </div>
            <h2 className="text-lg font-bold text-[#1A241E]">{shop.name}</h2>
            <p className="text-xs text-[#526058] flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#52796F]" />
              {shop.block} Block, {shop.district} District
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#526058] hover:text-[#1A241E] hover:bg-[#F1EFEA] transition-colors"
            aria-label="Close shop details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Shop Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3.5 border border-[#E5E2DC]">
              <div className="flex items-center gap-2 text-xs text-[#526058] mb-1">
                <User className="w-3.5 h-3.5 text-[#52796F]" />
                FPS Dealer
              </div>
              <p className="text-sm font-semibold text-[#1A241E]">
                {shop.dealerName}
              </p>
            </div>
            <div className="bg-white rounded-xl p-3.5 border border-[#E5E2DC]">
              <div className="flex items-center gap-2 text-xs text-[#526058] mb-1">
                <Users className="w-3.5 h-3.5 text-[#52796F]" />
                Ration Cardholders
              </div>
              <p className="text-sm font-semibold font-mono-num text-[#1A241E]">
                {shop.beneficiaries.toLocaleString()} families
              </p>
            </div>
          </div>

          {/* Commodity Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#526058]">
                Commodity Stock & Coverage
              </h3>
              <span className="text-[11px] text-[#52796F] font-medium">
                {forecastingEngine.modeLabel}
              </span>
            </div>

            {commodities.map((commodity) => {
              const forecast = forecastingEngine.forecastShopCommodity(
                shop,
                commodity
              );
              const coveragePct = Math.min(
                100,
                Math.round(
                  (forecast.daysRemaining /
                    Math.max(1, forecast.expectedReplenishmentDays + 3)) *
                    100
                )
              );

              return (
                <div
                  key={commodity}
                  className="bg-white rounded-xl p-4 border border-[#E5E2DC] shadow-card space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold capitalize text-[#1A241E]">
                        {commodity}
                      </span>
                      {forecast.deliveryDelayed && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#FDECE2] text-[#B44312]">
                          Delivery Delayed
                        </span>
                      )}
                    </div>
                    <RiskBadge level={forecast.riskLevel} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <p className="text-[11px] text-[#526058]">Current Stock</p>
                      <p className="text-base font-bold font-mono-num text-[#1A241E]">
                        {forecast.currentStockKg} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#526058]">Avg Demand</p>
                      <p className="text-base font-bold font-mono-num text-[#1A241E]">
                        {forecast.avgDailyDemandKg} kg/d
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#526058]">Coverage</p>
                      <p className="text-base font-bold font-mono-num text-[#1B4332]">
                        {forecast.daysRemaining} days
                      </p>
                    </div>
                  </div>

                  {/* Coverage bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-[#526058] mb-1">
                      <span>
                        Coverage vs {forecast.expectedReplenishmentDays}-day
                        replenishment
                      </span>
                      <span className="font-mono-num">
                        {forecast.daysRemaining}d /{' '}
                        {forecast.expectedReplenishmentDays}d
                      </span>
                    </div>
                    <div className="h-2 bg-[#F1EFEA] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          forecast.riskLevel === 'Critical'
                            ? 'bg-[#DC2626]'
                            : forecast.riskLevel === 'High'
                              ? 'bg-[#EA580C]'
                              : forecast.riskLevel === 'Medium'
                                ? 'bg-[#D97706]'
                                : 'bg-[#2D6A4F]'
                        }`}
                        style={{ width: `${coveragePct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#F1EFEA] text-xs">
                    <span className="text-[#526058] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#52796F]" />
                      Next delivery:{' '}
                      <strong className="text-[#1A241E] font-mono-num">
                        {forecast.nextDeliveryDate}
                      </strong>
                    </span>
                    {forecast.transferableSurplusKg > 0 ? (
                      <span className="text-[#1E6B3A] font-medium flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {forecast.transferableSurplusKg} kg safe surplus
                      </span>
                    ) : forecast.deficitKg > 0 ? (
                      <span className="text-[#B44312] font-semibold">
                        Deficit: ~{forecast.deficitKg} kg
                      </span>
                    ) : (
                      <span className="text-[#526058]">
                        Protected: {forecast.protectedStockKg} kg (incl.{' '}
                        {SAFETY_STOCK_DAYS}d buffer)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-4 border-t border-[#E5E2DC] flex items-center justify-between gap-3">
          <span className="text-xs text-[#526058]">
            Updated: {shop.lastUpdated}
          </span>
          <button
            onClick={() => {
              onClose();
              onNavigate('redistribution');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#2D6A4F] transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            View Redistribution Plan
          </button>
        </div>
      </aside>
    </div>
  );
};
