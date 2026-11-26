import {
  Commodity,
  CommodityForecast,
  CommodityStock,
  FairPriceShop,
  RedistributionRecommendation,
  RiskLevel,
} from '../types';

/**
 * Safety stock buffer in days kept at donor shops after protecting
 * their own projected demand until next replenishment.
 */
export const SAFETY_STOCK_DAYS = 2;

/**
 * Reference simulation date for deterministic demo forecasts.
 */
export const SIMULATION_BASE_DATE = new Date('2026-11-25T09:00:00');

/**
 * Modular ForecastingProvider interface so the simulation engine
 * can be swapped with a real ML model or government forecasting API later.
 */
export interface ForecastingProvider {
  readonly modeLabel: string;
  readonly isSimulation: boolean;
  forecastShopCommodity(
    shop: FairPriceShop,
    commodity: Commodity
  ): CommodityForecast;
  generateRedistributions(
    shops: FairPriceShop[],
    existingRecommendations: RedistributionRecommendation[]
  ): RedistributionRecommendation[];
}

export function addDaysISO(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + Math.round(days));
  return d.toISOString().split('T')[0];
}

export function calculateDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Math.round(R * c * 10) / 10;
}

export function classifyRisk(
  daysRemaining: number,
  expectedReplenishmentDays: number
): RiskLevel {
  if (daysRemaining <= 2 || daysRemaining < expectedReplenishmentDays - 1.8) {
    return 'Critical';
  }
  if (daysRemaining < expectedReplenishmentDays) {
    return 'High';
  }
  if (daysRemaining < expectedReplenishmentDays + 2) {
    return 'Medium';
  }
  return 'Low';
}

export function getShopOverallRisk(shop: FairPriceShop): RiskLevel {
  const riceStock = Math.max(0, shop.rice.currentStockKg);
  const wheatStock = Math.max(0, shop.wheat.currentStockKg);
  const riceDays =
    shop.rice.avgDailyDemandKg > 0
      ? riceStock / shop.rice.avgDailyDemandKg
      : 999;
  const wheatDays =
    shop.wheat.avgDailyDemandKg > 0
      ? wheatStock / shop.wheat.avgDailyDemandKg
      : 999;

  const riceRisk = classifyRisk(
    riceDays,
    Math.max(0, shop.rice.expectedReplenishmentDays)
  );
  const wheatRisk = classifyRisk(
    wheatDays,
    Math.max(0, shop.wheat.expectedReplenishmentDays)
  );

  const order: Record<RiskLevel, number> = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  return order[riceRisk] >= order[wheatRisk] ? riceRisk : wheatRisk;
}

export function getShopMinCoverageDays(shop: FairPriceShop): number {
  const riceStock = Math.max(0, shop.rice.currentStockKg);
  const wheatStock = Math.max(0, shop.wheat.currentStockKg);
  const riceDays =
    shop.rice.avgDailyDemandKg > 0
      ? riceStock / shop.rice.avgDailyDemandKg
      : 999;
  const wheatDays =
    shop.wheat.avgDailyDemandKg > 0
      ? wheatStock / shop.wheat.avgDailyDemandKg
      : 999;
  return Math.round(Math.min(riceDays, wheatDays) * 10) / 10;
}

/**
 * Deterministic simulation engine for PDS shortage prediction and
 * safety-stock-protected redistribution.
 */
export class SimulationForecastingEngine implements ForecastingProvider {
  readonly modeLabel = 'Predictive simulation — demo mode';
  readonly isSimulation = true;

  forecastShopCommodity(
    shop: FairPriceShop,
    commodity: Commodity
  ): CommodityForecast {
    const stock: CommodityStock = shop[commodity];
    const currentStockKg = Math.max(0, stock.currentStockKg);
    const avgDailyDemandKg = Math.max(0, stock.avgDailyDemandKg);
    const expectedReplenishmentDays = Math.max(
      0,
      stock.expectedReplenishmentDays
    );

    if (avgDailyDemandKg === 0) {
      return {
        shopId: shop.id,
        shopName: shop.name,
        district: shop.district,
        commodity,
        currentStockKg,
        avgDailyDemandKg: 0,
        daysRemaining: 999,
        expectedReplenishmentDays,
        nextDeliveryDate: stock.nextDeliveryDate || 'Not scheduled',
        predictedShortageDate: null,
        riskLevel: 'Low',
        deficitKg: 0,
        transferableSurplusKg: Math.floor(currentStockKg),
        protectedStockKg: 0,
        deliveryDelayed: Boolean(stock.deliveryDelayed),
      };
    }

    const daysRemaining =
      Math.round((currentStockKg / avgDailyDemandKg) * 10) / 10;

    const riskLevel = classifyRisk(daysRemaining, expectedReplenishmentDays);

    // Projected demand before replenishment + safety stock buffer
    const projectedDemandUntilReplenishment =
      avgDailyDemandKg * expectedReplenishmentDays;
    const safetyStockKg = avgDailyDemandKg * SAFETY_STOCK_DAYS;
    const protectedStockKg = projectedDemandUntilReplenishment + safetyStockKg;

    // Deficit: how much is needed to safely cover until replenishment + 1 day buffer
    const targetSafeCoverageDays = expectedReplenishmentDays + 1;
    const rawDeficit =
      daysRemaining < expectedReplenishmentDays
        ? Math.ceil(
            (targetSafeCoverageDays - daysRemaining) * avgDailyDemandKg
          )
        : 0;

    // Transferable surplus only after protecting projected demand + safety stock
    const transferableSurplusKg = Math.max(
      0,
      Math.floor(currentStockKg - protectedStockKg)
    );

    const predictedShortageDate =
      daysRemaining < expectedReplenishmentDays
        ? addDaysISO(SIMULATION_BASE_DATE, Math.floor(daysRemaining))
        : null;

    return {
      shopId: shop.id,
      shopName: shop.name,
      district: shop.district,
      commodity,
      currentStockKg,
      avgDailyDemandKg,
      daysRemaining,
      expectedReplenishmentDays,
      nextDeliveryDate: stock.nextDeliveryDate || 'Not scheduled',
      predictedShortageDate,
      riskLevel,
      deficitKg: rawDeficit,
      transferableSurplusKg,
      protectedStockKg,
      deliveryDelayed: Boolean(stock.deliveryDelayed),
    };
  }

  generateRedistributions(
    shops: FairPriceShop[],
    existingRecommendations: RedistributionRecommendation[]
  ): RedistributionRecommendation[] {
    const commodities: Commodity[] = ['rice', 'wheat'];
    const newRecommendations: RedistributionRecommendation[] = [];

    // Track already allocated pending/approved outgoing and incoming quantities
    const pendingOutgoing = new Map<string, number>();
    const pendingIncoming = new Map<string, number>();
    const activePairKeys = new Set<string>();

    for (const rec of existingRecommendations) {
      if (rec.status === 'Pending Approval') {
        const outKey = `${rec.sourceShopId}:${rec.commodity}`;
        const inKey = `${rec.destinationShopId}:${rec.commodity}`;
        pendingOutgoing.set(
          outKey,
          (pendingOutgoing.get(outKey) ?? 0) + rec.recommendedQtyKg
        );
        pendingIncoming.set(
          inKey,
          (pendingIncoming.get(inKey) ?? 0) + rec.recommendedQtyKg
        );
        activePairKeys.add(
          `${rec.sourceShopId}->${rec.destinationShopId}:${rec.commodity}`
        );
      }
    }

    for (const commodity of commodities) {
      const forecasts = shops.map((s) => ({
        shop: s,
        forecast: this.forecastShopCommodity(s, commodity),
      }));

      // Shops with shortage risk (daysRemaining < expectedReplenishmentDays)
      const needy = forecasts
        .filter((item) => item.forecast.deficitKg > 0)
        .sort((a, b) => a.forecast.daysRemaining - b.forecast.daysRemaining);

      // Donor shops with transferable surplus after safety stock
      const donors = forecasts
        .filter((item) => item.forecast.transferableSurplusKg >= 40)
        .map((item) => ({
          ...item,
          availableSurplusKg: Math.max(
            0,
            item.forecast.transferableSurplusKg -
              (pendingOutgoing.get(`${item.shop.id}:${commodity}`) ?? 0)
          ),
        }))
        .filter((d) => d.availableSurplusKg >= 40);

      for (const target of needy) {
        const alreadyIncoming =
          pendingIncoming.get(`${target.shop.id}:${commodity}`) ?? 0;
        const remainingDeficit = Math.max(
          0,
          target.forecast.deficitKg - alreadyIncoming
        );

        if (remainingDeficit < 20) continue;

        // Find nearest donor with sufficient surplus
        const rankedDonors = donors
          .filter((d) => d.shop.id !== target.shop.id && d.availableSurplusKg >= 40)
          .map((d) => ({
            donor: d,
            distanceKm: calculateDistanceKm(
              d.shop.coordinates,
              target.shop.coordinates
            ),
          }))
          .sort((a, b) => a.distanceKm - b.distanceKm);

        if (rankedDonors.length === 0) continue;

        const best = rankedDonors[0];
        const pairKey = `${best.donor.shop.id}->${target.shop.id}:${commodity}`;
        if (activePairKeys.has(pairKey)) continue;

        // Transfer up to remainingDeficit, rounded to nearest 10 kg, never exceeding availableSurplusKg
        const rawTransfer = Math.min(
          remainingDeficit,
          best.donor.availableSurplusKg
        );
        const recommendedQtyKg = Math.max(20, Math.floor(rawTransfer / 10) * 10);

        if (recommendedQtyKg < 20 || recommendedQtyKg > best.donor.availableSurplusKg) {
          continue;
        }

        // Verify donor safety post-transfer
        const sourceStockAfterKg =
          best.donor.forecast.currentStockKg -
          (pendingOutgoing.get(`${best.donor.shop.id}:${commodity}`) ?? 0) -
          recommendedQtyKg;
        const sourceCoverageAfterDays =
          Math.round(
            (sourceStockAfterKg / best.donor.forecast.avgDailyDemandKg) * 10
          ) / 10;

        if (
          sourceCoverageAfterDays <
          best.donor.forecast.expectedReplenishmentDays + SAFETY_STOCK_DAYS
        ) {
          continue;
        }

        const destCoverageAfterDays =
          Math.round(
            ((target.forecast.currentStockKg + recommendedQtyKg) /
              target.forecast.avgDailyDemandKg) *
              10
          ) / 10;

        const commodityLabel = commodity === 'rice' ? 'Rice' : 'Wheat';
        const reason = `${target.shop.id} has ${target.forecast.daysRemaining} days of ${commodityLabel.toLowerCase()} coverage vs ${target.forecast.expectedReplenishmentDays}-day replenishment lead time. ${best.donor.shop.id} holds ${best.donor.availableSurplusKg} kg safe surplus above its ${best.donor.forecast.expectedReplenishmentDays}-day demand and ${SAFETY_STOCK_DAYS}-day safety buffer.`;

        newRecommendations.push({
          id: `REC-${Date.now().toString().slice(-4)}-${newRecommendations.length + 1}`,
          sourceShopId: best.donor.shop.id,
          sourceShopName: best.donor.shop.name,
          sourceDistrict: best.donor.shop.district,
          destinationShopId: target.shop.id,
          destinationShopName: target.shop.name,
          destinationDistrict: target.shop.district,
          commodity,
          recommendedQtyKg,
          distanceKm: best.distanceKm,
          reason,
          sourceStockBeforeKg: best.donor.forecast.currentStockKg,
          sourceStockAfterKg,
          sourceCoverageAfterDays,
          destStockBeforeKg: target.forecast.currentStockKg,
          destCoverageBeforeDays: target.forecast.daysRemaining,
          destCoverageAfterDays,
          status: 'Pending Approval',
          createdAt: new Date().toISOString(),
        });

        best.donor.availableSurplusKg -= recommendedQtyKg;
        const donorOutKey = `${best.donor.shop.id}:${commodity}`;
        pendingOutgoing.set(
          donorOutKey,
          (pendingOutgoing.get(donorOutKey) ?? 0) + recommendedQtyKg
        );
        activePairKeys.add(pairKey);
      }
    }

    return newRecommendations;
  }
}

export const forecastingEngine: ForecastingProvider =
  new SimulationForecastingEngine();
