export interface SalesPoint {
  date: string; // YYYY-MM-DD
  quantity: number;
}

/**
 * Modular forecasting: any model just needs to implement `predict` over a
 * daily sales history and return next week's expected units. Swapping in a
 * more sophisticated model (seasonality, external regressors, etc.) later
 * means adding a class here, not touching the callers.
 */
export interface ForecastModel {
  predict(history: SalesPoint[]): number;
}

/** Default model: average of the last 4 complete weeks, projected forward. */
export class MovingAverageModel implements ForecastModel {
  predict(history: SalesPoint[]): number {
    if (history.length === 0) return 0;
    const last28 = history.slice(-28);
    const total = last28.reduce((sum, p) => sum + p.quantity, 0);
    const weeks = last28.length / 7;
    return Math.round(total / Math.max(1, weeks));
  }
}
