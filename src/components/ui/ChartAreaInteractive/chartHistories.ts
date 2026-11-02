/**
 * Several history lines in one chart (one per product).
 *
 * Without `historyData` a chart has one history line under the `historical`
 * key, and every forecast joins it. With `historyData`, each history has its
 * own line under `historical_<id>`, and a forecast joins a history only when
 * it can say which one: its `continues` names the history, or the chart has
 * exactly one. Otherwise the forecast starts on its own first point.
 */

/** The single history line's key, when the chart has no `historyData`. */
export const HISTORY_SERIES_KEY = 'historical';

export type HistoryItemData = {
  /** Unique within the chart. The line's data key is `historical_<id>`. */
  id: string | number;
  /** Legend and tooltip label. Defaults to the id. */
  name?: string;
  /**
   * Line colour. Defaults to the forecast palette taken from its far end, so
   * the first histories and the first forecasts differ. To pair a product's
   * history and forecast, pass the same colour to both.
   */
  color?: string;
};

/** Data key of one history line in `chartData` rows. */
export function historySeriesKey(id: string | number): string {
  return `${HISTORY_SERIES_KEY}_${id}`;
}

/** True for `historical` and for every `historical_<id>` key. */
export function isHistorySeriesKey(key: string): boolean {
  return key === HISTORY_SERIES_KEY || key.startsWith(`${HISTORY_SERIES_KEY}_`);
}

/** The data keys of the chart's history lines, in order. */
export function historySeriesKeys(histories?: HistoryItemData[]): string[] {
  return histories?.length
    ? histories.map(h => historySeriesKey(h.id))
    : [HISTORY_SERIES_KEY];
}

/**
 * The history line a forecast joins, or null when it joins none.
 *
 * - No `historyData`: the single `historical` line, as before.
 * - `continues` set: that history, or none when no history has that id.
 * - Otherwise: the only history when there is exactly one, else none.
 */
export function forecastHistoryKey(
  forecast: { continues?: string | number } | undefined,
  histories?: HistoryItemData[],
): string | null {
  if (!histories?.length) return HISTORY_SERIES_KEY;
  const continues = forecast?.continues;
  if (continues != null) {
    const match = histories.find(h => String(h.id) === String(continues));
    return match ? historySeriesKey(match.id) : null;
  }
  return histories.length === 1 ? historySeriesKey(histories[0].id) : null;
}
