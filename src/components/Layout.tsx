import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  Bell,
  LayoutDashboard,
  Menu,
  RotateCcw,
  Search,
  Sprout,
  Store,
  TrendingDown,
  X,
} from 'lucide-react';
import { PageId } from '../types';
import { forecastingEngine } from '../services/forecasting';
import { DemoDataBadge } from './Badge';

interface LayoutProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  unreadAlertsCount: number;
  pendingRecsCount: number;
  onResetDemo: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: {
  id: PageId;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
  { id: 'predictions', label: 'Shortage Prediction', icon: TrendingDown },
  { id: 'inventory', label: 'Shop Inventory', icon: Store },
  { id: 'redistribution', label: 'Smart Redistribution', icon: ArrowRightLeft },
  { id: 'alerts', label: 'Alerts', icon: Bell },
];

export const Layout: React.FC<LayoutProps> = ({
  activePage,
  onNavigate,
  searchQuery,
  onSearchChange,
  unreadAlertsCount,
  pendingRecsCount,
  onResetDemo,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1B4332] text-white">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D8F3DC] text-[#1B4332] flex items-center justify-center shadow-sm">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-none">
              RationPulse
            </h1>
            <p className="text-[11px] text-[#B7E4C7] mt-1 font-medium">
              Predict shortages. Prevent hunger.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[#95D5B2]/80">
          PDS Operations
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-[#D8F3DC]/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#74C69D]' : 'text-[#95D5B2]/80'
                  }`}
                />
                {item.label}
              </span>
              {item.id === 'redistribution' && pendingRecsCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#74C69D] text-[#0F291E] font-mono-num">
                  {pendingRecsCount}
                </span>
              )}
              {item.id === 'alerts' && unreadAlertsCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#FDE8E8] text-[#B42318] font-mono-num">
                  {unreadAlertsCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Transparency Footer */}
      <div className="p-4 m-3 rounded-xl bg-[#0F291E]/60 border border-white/10 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#B7E4C7]">
          <AlertTriangle className="w-3.5 h-3.5 text-[#74C69D] shrink-0" />
          <span>Prototype Transparency</span>
        </div>
        <p className="text-[11px] leading-relaxed text-[#D8F3DC]/75">
          {forecastingEngine.modeLabel}. All FPS metrics & transfers are
          fictional demo data.
        </p>
        <button
          onClick={onResetDemo}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo State
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F8F7F4]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#0F291E]/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-[#E5E2DC] px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-[220px] max-w-md">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-white border border-[#E5E2DC] text-[#1A241E] hover:bg-[#F1EFEA]"
                aria-label="Open navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#6B7A70] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search FPS ID, shop name, or district..."
                  className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-[#E5E2DC] rounded-xl text-[#1A241E] placeholder:text-[#7D8A82] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7D8A82] hover:text-[#1A241E]"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-[#E5E2DC] text-[#354F52]">
                <span className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse" />
                {forecastingEngine.modeLabel}
              </span>
              <DemoDataBadge className="py-1 px-2.5" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
