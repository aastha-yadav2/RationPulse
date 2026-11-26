import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  Bell,
  Package,
  ShieldCheck,
  Store,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  FairPriceShop,
  PageId,
  RedistributionRecommendation,
  RiskLevel,
  SystemAlert,
} from '../types';
import { WEEKLY_DEMAND_TREND } from '../data/demoData';
import {
  forecastingEngine,
  getShopOverallRisk,
} from '../services/forecasting';
import { DemoDataBadge, RiskBadge, SeverityBadge } from '../components/Badge';

interface OverviewDashboardProps {
  shops: FairPriceShop[];
  recommendations: RedistributionRecommendation[];
  alerts: SystemAlert[];
  onNavigate: (page: PageId) => void;
  onSelectShop: (shop: FairPriceShop) => void;
}

const RISK_COLORS: Record<RiskLevel, string> = {
  Low: '#2D6A4F',
  Medium: '#D97706',
  High: '#EA580C',
  Critical: '#DC2626',
};

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  shops,
  recommendations,
  alerts,
  onNavigate,
  onSelectShop,
}) => {
  const totalShops = shops.length;
  const totalDistricts = new Set(shops.map((s) => s.district)).size;
  const totalBeneficiaries = shops.reduce((acc, s) => acc + s.beneficiaries, 0);
  const totalRiceKg = shops.reduce((acc, s) => acc + s.rice.currentStockKg, 0);
  const totalWheatKg = shops.reduce(
    (acc, s) => acc + s.wheat.currentStockKg,
    0
  );
  const totalStockKg = totalRiceKg + totalWheatKg;

  const riskCounts: Record<RiskLevel, number> = {
    Low: 0,
    Medium: 0,
    High: 0,
    Critical: 0,
  };

  shops.forEach((shop) => {
    const risk = getShopOverallRisk(shop);
    riskCounts[risk] += 1;
  });

  const shopsAtRiskCount = riskCounts.High + riskCounts.Critical;
  const pendingRecs = recommendations.filter(
    (r) => r.status === 'Pending Approval'
  );
  const approvedRecs = recommendations.filter((r) => r.status === 'Approved');

  const stockChartData = shops.map((s) => ({
    id: s.id,
    name: s.id,
    fullName: s.name,
    rice: s.rice.currentStockKg,
    wheat: s.wheat.currentStockKg,
  }));

  const riskDistributionData = (
    ['Critical', 'High', 'Medium', 'Low'] as RiskLevel[]
  ).map((level) => ({
    name: level,
    value: riskCounts[level],
    color: RISK_COLORS[level],
  }));

  const recentAlerts = alerts.slice(0, 4);
  const demoScenarioPending = recommendations.find(
    (r) => r.isDemoScenario && r.status === 'Pending Approval'
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-[#1A241E]">
              PDS Operations Overview
            </h2>
            <DemoDataBadge />
          </div>
          <p className="text-sm text-[#526058] mt-1">
            Real-time ration stock visibility and shortage prevention across
            monitored Fair Price Shops ({forecastingEngine.modeLabel}).
          </p>
        </div>
        <button
          onClick={() => onNavigate('redistribution')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B4332] text-white text-sm font-semibold hover:bg-[#2D6A4F] transition-colors shadow-sm self-start sm:self-auto"
        >
          <ArrowRightLeft className="w-4 h-4" />
          Review Redistributions ({pendingRecs.length})
        </button>
      </div>

      {/* Interactive Demo Scenario Callout */}
      {demoScenarioPending && (
        <div className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] rounded-2xl p-5 text-white shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#74C69D] text-[#0F291E]">
                Interactive Demo Scenario
              </span>
              <span className="text-xs text-[#D8F3DC]">
                Safe Transfer Opportunity Detected
              </span>
            </div>
            <p className="text-sm sm:text-base font-semibold">
              Transfer {demoScenarioPending.recommendedQtyKg} kg Rice from{' '}
              <span className="font-mono-num underline decoration-[#74C69D]">
                {demoScenarioPending.sourceShopId}
              </span>{' '}
              to{' '}
              <span className="font-mono-num underline decoration-[#74C69D]">
                {demoScenarioPending.destinationShopId}
              </span>
            </p>
            <p className="text-xs text-[#D8F3DC]/90 max-w-2xl">
              {demoScenarioPending.destinationShopId} has 3.0 days coverage vs
              5-day replenishment. {demoScenarioPending.sourceShopId} retains 8.0
              days coverage after transfer (above 6-day lead time + 2-day safety
              buffer).
            </p>
          </div>
          <button
            onClick={() => onNavigate('redistribution')}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#1B4332] text-sm font-bold hover:bg-[#D8F3DC] transition-colors"
          >
            Inspect & Approve
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('inventory')}
          className="text-left bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-card hover:shadow-card-hover hover:border-[#B3C7B7] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#526058]">
              Total FPS Monitored
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F2F7F4] text-[#2D6A4F] flex items-center justify-center group-hover:bg-[#D8F3DC] transition-colors">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono-num text-[#1A241E] mt-3">
            {totalShops}
          </p>
          <p className="text-xs text-[#52796F] mt-1 font-medium">
            Across {totalDistricts} districts •{' '}
            {totalBeneficiaries.toLocaleString()} cardholders
          </p>
        </button>

        <button
          onClick={() => onNavigate('inventory')}
          className="text-left bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-card hover:shadow-card-hover hover:border-[#B3C7B7] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#526058]">
              Total Food Stock
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F2F7F4] text-[#2D6A4F] flex items-center justify-center group-hover:bg-[#D8F3DC] transition-colors">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono-num text-[#1A241E] mt-3">
            {totalStockKg.toLocaleString()}{' '}
            <span className="text-base font-semibold text-[#526058]">kg</span>
          </p>
          <p className="text-xs text-[#526058] mt-1">
            Rice: <strong className="font-mono-num">{totalRiceKg} kg</strong> •
            Wheat: <strong className="font-mono-num">{totalWheatKg} kg</strong>
          </p>
        </button>

        <button
          onClick={() => onNavigate('predictions')}
          className="text-left bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-card hover:shadow-card-hover hover:border-[#F6C8AE] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#526058]">
              Shops at Shortage Risk
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FDECE2] text-[#B44312] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono-num text-[#B44312] mt-3">
            {shopsAtRiskCount}
          </p>
          <p className="text-xs text-[#526058] mt-1">
            <span className="text-[#DC2626] font-semibold">
              {riskCounts.Critical} Critical
            </span>{' '}
            •{' '}
            <span className="text-[#EA580C] font-semibold">
              {riskCounts.High} High
            </span>{' '}
            risk
          </p>
        </button>

        <button
          onClick={() => onNavigate('redistribution')}
          className="text-left bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-card hover:shadow-card-hover hover:border-[#B3C7B7] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#526058]">
              Redistributions
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#D8F3DC] text-[#1B4332] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono-num text-[#1B4332] mt-3">
            {pendingRecs.length}{' '}
            <span className="text-base font-semibold text-[#526058]">
              pending
            </span>
          </p>
          <p className="text-xs text-[#52796F] mt-1 font-medium">
            {approvedRecs.length} approved transfers executed
          </p>
        </button>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stock Distribution Analytics */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#1A241E]">
                Stock Distribution by Fair Price Shop
              </h3>
              <p className="text-xs text-[#526058]">
                Current Rice vs Wheat inventory (kg) — click a bar to inspect
                shop
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-[#1A241E] font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#1B4332]" />
                Rice
              </span>
              <span className="flex items-center gap-1.5 text-[#1A241E] font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#74C69D]" />
                Wheat
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stockChartData}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                onClick={(state) => {
                  const id = state?.activeLabel;
                  if (id) {
                    const found = shops.find((s) => s.id === id);
                    if (found) onSelectShop(found);
                  }
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#EFECE6"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#526058' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#526058' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#F6F8F6' }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E2DC',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="rice"
                  name="Rice (kg)"
                  fill="#1B4332"
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                />
                <Bar
                  dataKey="wheat"
                  name="Wheat (kg)"
                  fill="#74C69D"
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-card flex flex-col">
          <div className="mb-3">
            <h3 className="text-base font-bold text-[#1A241E]">
              Risk Distribution
            </h3>
            <p className="text-xs text-[#526058]">
              Shop-level shortage risk classification
            </p>
          </div>
          <div className="h-52 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {riskDistributionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E2DC',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F1EFEA]">
            {riskDistributionData.map((item) => (
              <button
                key={item.name}
                onClick={() => onNavigate('predictions')}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[#F8F7F4] transition-colors text-xs"
              >
                <span className="flex items-center gap-2 font-medium text-[#1A241E]">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </span>
                <span className="font-mono-num font-bold text-[#1A241E]">
                  {item.value}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Weekly Demand Trend + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Demand Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#1A241E]">
                Weekly Demand Trend
              </h3>
              <p className="text-xs text-[#526058]">
                Aggregate daily grain offtake across all {totalShops} monitored
                FPS (kg)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-[#1A241E]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2D6A4F]" />
                Rice
              </span>
              <span className="flex items-center gap-1.5 font-medium text-[#1A241E]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#84A98C]" />
                Wheat
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={WEEKLY_DEMAND_TREND}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="riceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="wheatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84A98C" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#84A98C" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#EFECE6"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#526058' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#526058' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E2DC',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="riceDemandKg"
                  name="Rice Demand (kg)"
                  stroke="#2D6A4F"
                  strokeWidth={2}
                  fill="url(#riceGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="wheatDemandKg"
                  name="Wheat Demand (kg)"
                  stroke="#84A98C"
                  strokeWidth={2}
                  fill="url(#wheatGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E2DC] shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#2D6A4F]" />
              <h3 className="text-base font-bold text-[#1A241E]">
                Recent Alerts
              </h3>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-semibold text-[#2D6A4F] hover:text-[#1B4332] flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => {
                  const found = shops.find((s) => s.id === alert.shopId);
                  if (found) onSelectShop(found);
                }}
                className="p-3 rounded-xl border border-[#F1EFEA] bg-[#F8F7F4]/60 hover:bg-[#F2F7F4] hover:border-[#D3DFD5] transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono-num text-xs font-bold text-[#1B4332]">
                    {alert.shopId}
                  </span>
                  <SeverityBadge severity={alert.severity} />
                </div>
                <p className="text-xs font-semibold text-[#1A241E] leading-snug">
                  {alert.title}
                </p>
                <div className="flex items-center justify-between text-[11px] text-[#6B7A70]">
                  <span>{alert.district}</span>
                  <span>{alert.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk summary quick strip */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E2DC] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs text-[#526058]">
          <span className="font-semibold text-[#1A241E]">
            Top Priority Shops:
          </span>
          {shops
            .filter((s) => {
              const r = getShopOverallRisk(s);
              return r === 'Critical' || r === 'High';
            })
            .map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectShop(s)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8F7F4] border border-[#E5E2DC] hover:border-[#2D6A4F] transition-colors"
              >
                <span className="font-mono-num font-bold text-[#1A241E]">
                  {s.id}
                </span>
                <RiskBadge level={getShopOverallRisk(s)} />
              </button>
            ))}
        </div>
        <span className="text-[11px] text-[#6B7A70]">
          Click any shop badge to inspect inventory & coverage
        </span>
      </div>
    </div>
  );
};
