import "server-only";
import { db } from "@/lib/db";
import { MovingAverageModel, type SalesPoint, type ForecastModel } from "./forecast-model";

export type { SalesPoint, ForecastModel };
export { MovingAverageModel };

function defaultModel(): ForecastModel {
  return new MovingAverageModel();
}

/** Daily sales counts for a product over the last N days, from confirmed
 * (payment-verified) orders only — a pending or failed order isn't a sale. */
export async function getSalesHistory(productId: string, days = 90): Promise<SalesPoint[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const items = await db.orderItem.findMany({
    where: {
      productId,
      order: { createdAt: { gte: since }, payment: { status: "SUCCESS" } },
    },
    select: { quantity: true, order: { select: { createdAt: true } } },
  });

  const byDate = new Map<string, number>();
  for (const item of items) {
    const key = item.order.createdAt.toISOString().slice(0, 10);
    byDate.set(key, (byDate.get(key) ?? 0) + item.quantity);
  }

  const points: SalesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    points.push({ date: key, quantity: byDate.get(key) ?? 0 });
  }
  return points;
}

export function rollUpWeekly(daily: SalesPoint[]): { weekOf: string; quantity: number }[] {
  const weeks: { weekOf: string; quantity: number }[] = [];
  for (let i = 0; i < daily.length; i += 7) {
    const chunk = daily.slice(i, i + 7);
    if (chunk.length === 0) continue;
    weeks.push({
      weekOf: chunk[0].date,
      quantity: chunk.reduce((sum, p) => sum + p.quantity, 0),
    });
  }
  return weeks;
}

export interface ProductForecast {
  productId: string;
  productName: string;
  sku: string;
  last7Days: number;
  last30Days: number;
  predictedNextWeek: number;
}

export async function getForecastForAllProducts(): Promise<ProductForecast[]> {
  const products = await db.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, sku: true },
  });

  const model = defaultModel();

  const forecasts = await Promise.all(
    products.map(async (p) => {
      const history = await getSalesHistory(p.id, 90);
      const last7Days = history.slice(-7).reduce((sum, d) => sum + d.quantity, 0);
      const last30Days = history.slice(-30).reduce((sum, d) => sum + d.quantity, 0);
      return {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        last7Days,
        last30Days,
        predictedNextWeek: model.predict(history),
      };
    })
  );

  return forecasts.sort((a, b) => b.last30Days - a.last30Days);
}
