import cn from 'classnames';
import React, { useMemo, useRef } from 'react';

import { Button } from '#uilib/components/ui/Button';
import { FORECAST_LINE_COLORS } from '#uilib/components/ui/ChartAreaInteractive/ChartLines';
import { PageXScroll } from '#uilib/components/ui/Page';
import {
  Table,
  TableBody,
  TableCell,
  TableCellValue,
  TableHead,
  TableHeader,
  TableRow,
} from '#uilib/components/ui/Table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#uilib/components/ui/Tooltip';
import { InfoIcon, Pencil, TableIcon } from 'lucide-react';

import S from './PerformanceChart.styl';
import {
  calculateAccuracy,
  calculateBenefit,
  formatAccuracy,
  formatBenefit,
  formatError,
  formatROI,
  getForecastModelDisplayName,
} from './performanceChart.helpers';

const DEFAULT_INVESTMENT_COST = 35000; // Investment Cost (IC) - annual cost of solution

const CUSTOM_PERFORMANCE_ROW_COLOR = 'var(--sb-purple-400)';

// Component wrapper for table rows with long tap support
function ModelTableRow({
  modelKey,
  row,
}: {
  modelKey: string;
  row: React.ReactElement;
  onToggleSeries?: (modelKey: string) => void;
  isHidden?: boolean;
}) {
  const rowRef = useRef<HTMLTableRowElement>(null);

  return React.cloneElement(row, {
    ref: (el: HTMLTableRowElement | null) => {
      rowRef.current = el;
      // Call original ref if it exists
      const originalRef = (row as any).ref;
      if (typeof originalRef === 'function') {
        originalRef(el);
      } else if (originalRef) {
        originalRef.current = el;
      }
    },
    className: (row.props as any).className,
  } as any);
}

export interface ForecastModelData {
  key: string;
  mae: number;
  mape: number;
}

export interface AdjustParameters {
  procurementVolume: number;
  variableRawMaterialCostShare: number;
  controllableCosts: number;
  currentForecastAccuracy: number;
  expectedImprovement: number;
  analystHourlyRate: number;
}

interface PerformanceTableProps {
  forecastModels: ForecastModelData[];
  adjustParameters: AdjustParameters;
  onAdjustParametersChange: (params: AdjustParameters) => void;
  /** Shown when custom spaghetti matrix is saved (localStorage). Metrics vs historical for selected horizon. */
  customPerformance?: { label: string; mae: number; mape: number } | null;
  /** Opens custom performance dialog; used by the custom row edit control. */
  onEditCustomPerformance?: () => void;
  /** Last row with Add custom data (hidden when custom row already present); per-horizon + spaghetti. */
  showAddEditCustomDataButton?: boolean;
  addEditCustomDataDisabled?: boolean;
}

// Calculate color for a model key
const getModelColor = (key: string) => {
  if (key === 'model') return 'var(--sb-cyan-400)';
  return FORECAST_LINE_COLORS[0];
};

export function PerformanceTable({
  forecastModels,
  adjustParameters,
  onAdjustParametersChange,
  customPerformance = null,
  onEditCustomPerformance,
  showAddEditCustomDataButton = false,
  addEditCustomDataDisabled = false,
}: PerformanceTableProps) {
  // Separate Sybilion AI model from drift model
  const { sybilionModel, driftModel } = useMemo(() => {
    const sybilion = forecastModels.find(model => model.key === 'model');
    const drift = forecastModels.find(model => model.key === 'drift');
    return {
      sybilionModel: sybilion,
      driftModel: drift,
    };
  }, [forecastModels]);

  // Calculate table rows for Sybilion AI model
  const sybilionRow = useMemo(() => {
    if (!sybilionModel) return null;

    const accuracy = calculateAccuracy(sybilionModel.mape);
    const error = formatError(sybilionModel.mae);
    // Calculate benefit using actual accuracy improvement over baseline (drift)
    const baselineAccuracy = driftModel
      ? calculateAccuracy(driftModel.mape)
      : undefined;
    const benefit = calculateBenefit(
      sybilionModel.mae,
      sybilionModel.mape,
      adjustParameters,
      baselineAccuracy,
    );
    const roi = formatROI(benefit, DEFAULT_INVESTMENT_COST);

    return {
      key: sybilionModel.key,
      forecast: getForecastModelDisplayName(sybilionModel.key),
      color: getModelColor(sybilionModel.key),
      accuracy: formatAccuracy(accuracy),
      error,
      roi,
      benefit: formatBenefit(benefit),
    };
  }, [sybilionModel, driftModel, adjustParameters, getModelColor]);

  // Calculate table row for drift model
  const driftRow = useMemo(() => {
    if (!driftModel) return null;

    const accuracy = calculateAccuracy(driftModel.mape);
    const error = formatError(driftModel.mae);
    // Baseline model has no improvement, so benefit is 0
    const benefit = 0;
    const roi = formatROI(benefit, DEFAULT_INVESTMENT_COST);

    return {
      key: driftModel.key,
      forecast: getForecastModelDisplayName(driftModel.key),
      color: getModelColor(driftModel.key),
      accuracy: formatAccuracy(accuracy),
      error,
      roi,
      benefit: formatBenefit(benefit),
    };
  }, [driftModel, adjustParameters, getModelColor]);

  const customRow = useMemo(() => {
    if (!customPerformance) return null;
    const accuracy = calculateAccuracy(customPerformance.mape);
    const error = formatError(customPerformance.mae);
    const baselineAccuracy = driftModel
      ? calculateAccuracy(driftModel.mape)
      : undefined;
    const benefit = calculateBenefit(
      customPerformance.mae,
      customPerformance.mape,
      adjustParameters,
      baselineAccuracy,
    );
    const roi = formatROI(benefit, DEFAULT_INVESTMENT_COST);

    return {
      key: 'custom_performance',
      forecast: customPerformance.label,
      color: CUSTOM_PERFORMANCE_ROW_COLOR,
      accuracy: formatAccuracy(accuracy),
      error,
      roi,
      benefit: formatBenefit(benefit),
    };
  }, [customPerformance, driftModel, adjustParameters]);

  const showCustomActionsColumn = Boolean(customRow);

  return (
    <div className={S.tableSection}>
      <div className={S.tableWrapper}>
        <PageXScroll
          size="md"
          fullWidth
          innerClassName={S.tableContainer}
          scrollbarClassName={S.scrollbar}
        >
          <Table withPaddings className={S.table}>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <TableCellValue>
                    Forecast
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <InfoIcon size={16} style={{ cursor: 'help' }} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" maxWidth={300}>
                        Sybilion AI forecast vs other forecasting methods: MEAN,
                        Seasonal, ARMA, ARIMA, Linear, Theta
                      </TooltipContent>
                    </Tooltip>
                  </TableCellValue>
                </TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Error</TableHead>
                <TableHead>
                  <TableCellValue>
                    ROI
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <InfoIcon size={16} style={{ cursor: 'help' }} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" maxWidth={300}>
                        ROI is calculated using default contract annual price.
                      </TooltipContent>
                    </Tooltip>
                  </TableCellValue>
                </TableHead>
                <TableHead>
                  <TableCellValue>
                    Benefit p/a
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <InfoIcon size={16} style={{ cursor: 'help' }} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" maxWidth={300}>
                        Annual Benefit of using Sybilion AI forecast compared to
                        alternative forecasting methods. Calculated using
                        default assumptions: Procurement Volume €100,000,000 ·
                        Variable Share 50% · Controllable Share 60%
                      </TooltipContent>
                    </Tooltip>
                  </TableCellValue>
                </TableHead>
                {showCustomActionsColumn && <TableHead />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Sybilion AI row */}
              {sybilionRow && (
                <ModelTableRow
                  modelKey={sybilionRow.key}
                  row={
                    <TableRow key={sybilionRow.key}>
                      <TableCell>
                        <div className={S.forecastCell}>
                          <span
                            className={S.colorCircle}
                            style={{ backgroundColor: sybilionRow.color }}
                          />
                          {sybilionRow.forecast}
                        </div>
                      </TableCell>
                      <TableCell>{sybilionRow.accuracy}</TableCell>
                      <TableCell>{sybilionRow.error}</TableCell>
                      <TableCell>{sybilionRow.roi}</TableCell>
                      <TableCell>{sybilionRow.benefit}</TableCell>
                      {showCustomActionsColumn && <TableCell />}
                    </TableRow>
                  }
                />
              )}

              {/* Drift model row */}
              {driftRow && (
                <ModelTableRow
                  modelKey={driftRow.key}
                  row={
                    <TableRow key={driftRow.key}>
                      <TableCell>
                        <div className={S.forecastCell}>
                          <span
                            className={S.colorCircle}
                            style={{ backgroundColor: driftRow.color }}
                          />
                          {driftRow.forecast}
                        </div>
                      </TableCell>
                      <TableCell>{driftRow.accuracy}</TableCell>
                      <TableCell>{driftRow.error}</TableCell>
                      <TableCell>{driftRow.roi}</TableCell>
                      <TableCell>{driftRow.benefit}</TableCell>
                      {showCustomActionsColumn && <TableCell />}
                    </TableRow>
                  }
                />
              )}

              {customRow && (
                <ModelTableRow
                  modelKey={customRow.key}
                  row={
                    <TableRow key={customRow.key}>
                      <TableCell>
                        <div className={S.forecastCell}>
                          <span
                            className={S.colorCircle}
                            style={{ backgroundColor: customRow.color }}
                          />
                          {customRow.forecast}
                        </div>
                      </TableCell>
                      <TableCell>{customRow.accuracy}</TableCell>
                      <TableCell>{customRow.error}</TableCell>
                      <TableCell>{customRow.roi}</TableCell>
                      <TableCell>{customRow.benefit}</TableCell>
                      {showCustomActionsColumn && (
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                icon
                                aria-label="Edit custom performance data"
                                onClick={() => onEditCustomPerformance?.()}
                              >
                                <Pencil size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              Edit custom performance data
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  }
                />
              )}

              {showAddEditCustomDataButton && !customPerformance && (
                <TableRow className={S.tableCustomDataFooterRow}>
                  <TableCell
                    colSpan={5 + (showCustomActionsColumn ? 1 : 0)}
                    className={S.tableCustomDataFooterCell}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={addEditCustomDataDisabled}
                      onClick={() => onEditCustomPerformance?.()}
                    >
                      <TableIcon size={16} />
                      Add custom data
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </PageXScroll>
      </div>
    </div>
  );
}
