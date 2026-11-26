export type Commodity = 'rice' | 'wheat';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type RecommendationStatus = 'Pending Approval' | 'Approved' | 'Rejected';

export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Info';

export type AlertCategory = 'Shortage Risk' | 'Delivery Delay' | 'Stock Imbalance';

export type PageId =
  | 'overview'
  | 'predictions'
  | 'inventory'
  | 'redistribution'
  | 'alerts';

export interface CommodityStock {
  currentStockKg: number;
  avgDailyDemandKg: number;
  expectedReplenishmentDays: number;
  nextDeliveryDate: string; // ISO date YYYY-MM-DD
  deliveryDelayed?: boolean;
  delayDays?: number;
}

export interface FairPriceShop {
  id: string;
  name: string;
  district: string;
  block: string;
  dealerName: string;
  beneficiaries: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  rice: CommodityStock;
  wheat: CommodityStock;
  lastUpdated: string;
}

export interface CommodityForecast {
  shopId: string;
  shopName: string;
  district: string;
  commodity: Commodity;
  currentStockKg: number;
  avgDailyDemandKg: number;
  daysRemaining: number;
  expectedReplenishmentDays: number;
  nextDeliveryDate: string;
  predictedShortageDate: string | null;
  riskLevel: RiskLevel;
  deficitKg: number;
  transferableSurplusKg: number;
  protectedStockKg: number;
  deliveryDelayed: boolean;
}

export interface RedistributionRecommendation {
  id: string;
  sourceShopId: string;
  sourceShopName: string;
  sourceDistrict: string;
  destinationShopId: string;
  destinationShopName: string;
  destinationDistrict: string;
  commodity: Commodity;
  recommendedQtyKg: number;
  distanceKm: number;
  reason: string;
  sourceStockBeforeKg: number;
  sourceStockAfterKg: number;
  sourceCoverageAfterDays: number;
  destStockBeforeKg: number;
  destCoverageBeforeDays: number;
  destCoverageAfterDays: number;
  status: RecommendationStatus;
  createdAt: string;
  isDemoScenario?: boolean;
}

export interface SystemAlert {
  id: string;
  shopId: string;
  shopName: string;
  district: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  description: string;
  commodity?: Commodity;
  timestamp: string;
  acknowledged: boolean;
}

export interface WeeklyDemandPoint {
  day: string;
  riceDemandKg: number;
  wheatDemandKg: number;
  projectedTotalKg: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description?: string;
}
