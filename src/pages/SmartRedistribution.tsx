import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Navigation,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import {
  RecommendationStatus,
  RedistributionRecommendation,
} from '../types';
import { SAFETY_STOCK_DAYS } from '../services/forecasting';
import { DemoDataBadge, StatusBadge } from '../components/Badge';

interface SmartRedistributionProps {
  recommendations: RedistributionRecommendation[];
  searchQuery: string;
  onGenerate: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const SmartRedistribution: React.FC<SmartRedistributionProps> = ({
  recommendations,
  searchQuery,
  onGenerate,
  onApprove,
  onReject,
}) => {
  const [statusFilter, setStatusFilter] = useState<
    'All' | RecommendationStatus
  >('All');

  const counts = useMemo(() => {
    return {
      All: recommendations.length,
      'Pending Approval': recommendations.filter(
        (r) => r.status === 'Pending Approval'
      ).length,
      Approved: recommendations.filter((r) => r.status === 'Approved').length,
      Rejected: recommendations.filter((r) => r.status === 'Rejected').length,
    };
  }, [recommendations]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return recommendations.filter((rec) => {
      if (statusFilter !== 'All' && rec.status !== statusFilter) return false;
      if (
        q &&
        !rec.sourceShopId.toLowerCase().includes(q) &&
        !rec.destinationShopId.toLowerCase().includes(q) &&
        !rec.sourceShopName.toLowerCase().includes(q) &&
        !rec.destinationShopName.toLowerCase().includes(q) &&
        !rec.commodity.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [recommendations, statusFilter, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-[#1A241E]">
              Smart Redistribution
            </h2>
            <DemoDataBadge />
          </div>
          <p className="text-sm text-[#526058] mt-1">
            Matches deficit FPS with nearby surplus depots while strictly
            protecting donor demand and safety buffers.
          </p>
        </div>

        <button
          onClick={onGenerate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B4332] text-white text-sm font-semibold hover:bg-[#2D6A4F] active:scale-[0.99] transition-all shadow-sm self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-[#74C69D]" />
          Generate Recommendation
        </button>
      </div>

      {/* Safety Policy Banner */}
      <div className="bg-[#F2F7F4] border border-[#D3DFD5] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
          <div className="text-xs text-[#354F52] space-y-0.5">
            <p className="font-semibold text-[#1B4332]">
              Donor Safety Guardrail Active
            </p>
            <p>
              Transferable surplus is computed only after protecting{' '}
              <strong>
                (Avg Daily Demand × Replenishment Lead Time) + {SAFETY_STOCK_DAYS}
                -Day Safety Stock
              </strong>
              . No transfer is ever recommended if it puts the donor shop at
              risk.
            </p>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {(
          ['All', 'Pending Approval', 'Approved', 'Rejected'] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              statusFilter === tab
                ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                : 'bg-white text-[#526058] border-[#E5E2DC] hover:border-[#B3C7B7] hover:text-[#1A241E]'
            }`}
          >
            {tab}
            <span
              className={`px-1.5 py-0.5 rounded-md font-mono-num text-[11px] ${
                statusFilter === tab
                  ? 'bg-white/20 text-white'
                  : 'bg-[#F1EFEA] text-[#1A241E]'
              }`}
            >
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Recommendation Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-[#E5E2DC] text-center space-y-3">
          <p className="text-sm font-medium text-[#526058]">
            No redistribution recommendations in this view.
          </p>
          <button
            onClick={onGenerate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F2F7F4] text-[#1B4332] text-xs font-semibold hover:bg-[#D8F3DC] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Scan Network for New Transfers
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-card hover:shadow-card-hover transition-all space-y-4"
            >
              {/* Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-num text-xs font-bold text-[#526058]">
                    {rec.id}
                  </span>
                  <StatusBadge status={rec.status} />
                  <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F2F7F4] text-[#1B4332] border border-[#D3DFD5]">
                    {rec.commodity}
                  </span>
                  {rec.isDemoScenario && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#1B4332] text-[#D8F3DC]">
                      Seeded Demo Scenario
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#526058] font-medium">
                  <Navigation className="w-3.5 h-3.5 text-[#52796F]" />
                  <span className="font-mono-num">{rec.distanceKm} km</span>{' '}
                  transfer distance
                </div>
              </div>

              {/* Transfer Route + Quantity */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-[#F8F7F4] rounded-xl p-4 border border-[#EFECE6]">
                {/* Source */}
                <div className="lg:col-span-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#52796F]">
                    Source Donor Shop
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono-num text-xs font-bold px-2 py-0.5 rounded bg-[#D8F3DC] text-[#1B4332]">
                      {rec.sourceShopId}
                    </span>
                    <span className="text-sm font-bold text-[#1A241E]">
                      {rec.sourceShopName}
                    </span>
                  </div>
                  <p className="text-xs text-[#526058] mt-1">
                    {rec.sourceDistrict} District
                  </p>
                </div>

                {/* Arrow & Qty */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center py-1">
                  <div className="px-4 py-1.5 rounded-full bg-[#1B4332] text-white font-mono-num text-sm font-bold shadow-sm flex items-center gap-2">
                    <span>{rec.recommendedQtyKg} kg</span>
                    <ArrowRight className="w-4 h-4 text-[#74C69D]" />
                  </div>
                  <span className="text-[11px] text-[#526058] mt-1 capitalize">
                    Recommended {rec.commodity} transfer
                  </span>
                </div>

                {/* Destination */}
                <div className="lg:col-span-4 lg:text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#B44312]">
                    Destination Deficit Shop
                  </p>
                  <div className="flex items-center lg:justify-end gap-2 mt-1">
                    <span className="font-mono-num text-xs font-bold px-2 py-0.5 rounded bg-[#FDECE2] text-[#B44312]">
                      {rec.destinationShopId}
                    </span>
                    <span className="text-sm font-bold text-[#1A241E]">
                      {rec.destinationShopName}
                    </span>
                  </div>
                  <p className="text-xs text-[#526058] mt-1">
                    {rec.destinationDistrict} District
                  </p>
                </div>
              </div>

              {/* Reason */}
              <p className="text-xs sm:text-sm text-[#354F52] leading-relaxed">
                <strong className="text-[#1A241E]">Rationale: </strong>
                {rec.reason}
              </p>

              {/* Post-Transfer Impact & Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-[#F1EFEA]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  <div className="px-3.5 py-2.5 rounded-xl bg-[#F2F7F4] border border-[#D3DFD5]">
                    <p className="text-[11px] text-[#526058]">
                      Source Stock After Transfer
                    </p>
                    <p className="text-sm font-bold font-mono-num text-[#1B4332] mt-0.5">
                      {rec.sourceStockAfterKg} kg{' '}
                      <span className="text-xs font-medium text-[#52796F]">
                        ({rec.sourceCoverageAfterDays}d safe coverage)
                      </span>
                    </p>
                  </div>
                  <div className="px-3.5 py-2.5 rounded-xl bg-[#F8F7F4] border border-[#E5E2DC]">
                    <p className="text-[11px] text-[#526058]">
                      Destination Coverage After Transfer
                    </p>
                    <p className="text-sm font-bold font-mono-num text-[#1A241E] mt-0.5">
                      {rec.destCoverageBeforeDays}d{' '}
                      <span className="text-[#52796F]">→</span>{' '}
                      <span className="text-[#1E6B3A]">
                        {rec.destCoverageAfterDays}d coverage
                      </span>
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {rec.status === 'Pending Approval' ? (
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => onReject(rec.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E2DC] bg-white text-xs font-semibold text-[#526058] hover:bg-[#FDE8E8] hover:text-[#B42318] hover:border-[#F5B7B7] transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => onApprove(rec.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#2D6A4F] transition-colors shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      Approve Transfer
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-medium text-[#526058] shrink-0">
                    {rec.status === 'Approved'
                      ? 'Inventory balances updated'
                      : 'Transfer declined by administrator'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
