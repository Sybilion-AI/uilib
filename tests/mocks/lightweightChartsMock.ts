/**
 * Stub for the ESM-only `lightweight-charts` package, which jest's CJS
 * resolver cannot load. Provides the runtime values uilib imports; tests
 * import these modules but never mount a lightweight chart.
 */

export const ColorType = {
  Solid: 'solid',
  VerticalGradient: 'gradient',
};

export const LineStyle = {
  Solid: 0,
  Dotted: 1,
  Dashed: 2,
  LargeDashed: 3,
  SparseDotted: 4,
};

export const LineType = {
  Simple: 0,
  WithSteps: 1,
  Curved: 2,
};

export const LineSeries = { type: 'Line' };

export const customSeriesDefaultOptions = {
  lastValueVisible: true,
  priceLineVisible: true,
};

export function createChart(): never {
  throw new Error(
    'lightweight-charts is mocked in jest; rendering charts is not supported.',
  );
}
