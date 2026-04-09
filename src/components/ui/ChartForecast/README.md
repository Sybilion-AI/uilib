# ChartForecast Component

A Recharts-based forecast visualization component that replaces Plotly functionality from the platform.

## Features

- ✅ Historical + Forecast line charts
- ✅ Confidence bands (24m/12m/6m horizons)
- ✅ Forecast boundaries (guard rails)
- ✅ Dark/Light theme support
- ✅ Interactive legend (click to hide series)
- ✅ Smooth connection between historical and forecast
- ✅ Focused view mode (zoomed time range)
- ✅ Loading states

## Usage

### Basic Example

```tsx
import { ChartForecast } from 'uilib';

function ForecastPage() {
  const historicalData = [
    ['2023-01-01', 100],
    ['2023-02-01', 120],
    ['2023-03-01', 115],
  ];

  const forecastData = {
    forecast_series: {
      '2024-01-01': {
        forecast: 150,
        lower_boundary: { '24m': 130 },
        upper_boundary: { '24m': 170 },
      },
      '2024-02-01': {
        forecast: 155,
        lower_boundary: { '24m': 135 },
        upper_boundary: { '24m': 175 },
      },
    },
  };

  return (
    <ChartForecast
      historicalData={historicalData}
      forecastData={forecastData}
      showConfidenceBands
      height={500}
    />
  );
}
```

### With Change Point Boundaries

```tsx
<ChartForecast
  historicalData={historicalData}
  forecastData={forecastData}
  changePoints={changePointData}
  showBoundaries
  showConfidenceBands
  isDarkTheme
/>
```

### Focused View

```tsx
<ChartForecast
  historicalData={historicalData}
  forecastData={forecastData}
  focused // Shows zoomed time range
  mode="deterministic"
/>
```

## Props

| Prop                  | Type                                                            | Default           | Description                          |
| --------------------- | --------------------------------------------------------------- | ----------------- | ------------------------------------ |
| `historicalData`      | `TimeSeriesPoint[]`                                             | required          | Historical time series data          |
| `forecastData`        | `ForecastData`                                                  | required          | Forecast data from API               |
| `changePoints`        | `ChangePointDetection`                                          | -                 | Optional change point detection data |
| `mode`                | `'deterministic' \| 'probabilistic' \| 'boundaries' \| 'cloud'` | `'deterministic'` | Visualization mode                   |
| `showConfidenceBands` | `boolean`                                                       | `true`            | Show confidence bands                |
| `showBoundaries`      | `boolean`                                                       | `false`           | Show forecast boundaries             |
| `loading`             | `boolean`                                                       | `false`           | Loading state                        |
| `isDarkTheme`         | `boolean`                                                       | `false`           | Dark theme mode                      |
| `focused`             | `boolean`                                                       | `false`           | Focused view mode                    |
| `height`              | `number`                                                        | `400`             | Chart height in pixels               |

## Data Types

### TimeSeriesPoint

```typescript
type TimeSeriesPoint = [string, number]; // [date, value]
```

### ForecastData

```typescript
interface ForecastData {
  forecast_series: {
    [date: string]: {
      forecast: number;
      lower_boundary?: {
        '6m'?: number;
        '12m'?: number;
        '24m'?: number;
      };
      upper_boundary?: {
        '6m'?: number;
        '12m'?: number;
        '24m'?: number;
      };
    };
  };
  forecast_start?: string;
  forecast_end?: string;
  last_valid_data_index?: string;
}
```

## Customization

The component uses CSS custom properties for theming:

- `--background` - Chart background
- `--foreground` - Text color
- `--muted-foreground` - Muted text
- `--destructive` - Error color
- `--sb-purple-600` - Confidence band color

<!-- ## Next Steps
1. Add probabilistic mode with quantile bands
2. Add rainbow visualization mode
3. Add backtest overlays
4. Add export/download functionality -->
