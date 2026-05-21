import { jsx, jsxs } from 'react/jsx-runtime';
import React__default, { useMemo, useRef } from 'react';
import { Button } from '../../ui/Button/Button.js';
import { FORECAST_LINE_COLORS } from '../../ui/ChartAreaInteractive/ChartLines.js';
import '../../ui/Page/AppShell/AppShell.js';
import 'classnames';
import 'react-router-dom';
import '../../ui/Sidebar/Sidebar.js';
import { InfoIcon, Pencil, TableIcon } from 'lucide-react';
import '../../ui/Page/Breadcrumbs/Breadcrumbs.styl.js';
import '../../ui/Page/pageContext.js';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../ui/Tooltip/Tooltip.js';
import '../../ui/Page/PageHeader/PageHeader.styl.js';
import '../../ui/Page/PageEmptyCanvas/PageEmptyCanvas.styl.js';
import '../../ui/Page/PageContent/PageContent.styl.js';
import '@homecode/ui';
import '../../ui/Page/PageScroll/PageScroll.styl.js';
import { PageXScroll } from '../../ui/Page/PageXScroll/PageXScroll.js';
import '../../ui/Page/PageFooter/PageFooter.styl.js';
import '@radix-ui/react-tabs';
import '../../ui/Tabs/Tabs.styl.js';
import '../../ui/Page/PageTabs/PageTabs.styl.js';
import '../../ui/Page/PageColumns/PageColumns.styl.js';
import '../../ui/Page/SectionHeader/SectionHeader.styl.js';
import { Table, TableHeader, TableRow, TableHead, TableCellValue, TableBody, TableCell } from '../../ui/Table/Table.js';
import S from './PerformanceChart.styl.js';
import { calculateAccuracy, formatError, calculateBenefit, formatROI, getForecastModelDisplayName, formatAccuracy, formatBenefit } from './performanceChart.helpers.js';

const DEFAULT_INVESTMENT_COST = 35000; // Investment Cost (IC) - annual cost of solution
const CUSTOM_PERFORMANCE_ROW_COLOR = 'var(--sb-purple-400)';
// Component wrapper for table rows with long tap support
function ModelTableRow({ modelKey, row, }) {
    const rowRef = useRef(null);
    return React__default.cloneElement(row, {
        ref: (el) => {
            rowRef.current = el;
            // Call original ref if it exists
            const originalRef = row.ref;
            if (typeof originalRef === 'function') {
                originalRef(el);
            }
            else if (originalRef) {
                originalRef.current = el;
            }
        },
        className: row.props.className,
    });
}
// Calculate color for a model key
const getModelColor = (key) => {
    if (key === 'model')
        return 'var(--sb-cyan-400)';
    return FORECAST_LINE_COLORS[0];
};
function PerformanceTable({ forecastModels, adjustParameters, onAdjustParametersChange, customPerformance = null, onEditCustomPerformance, showAddEditCustomDataButton = false, addEditCustomDataDisabled = false, }) {
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
        if (!sybilionModel)
            return null;
        const accuracy = calculateAccuracy(sybilionModel.mape);
        const error = formatError(sybilionModel.mae);
        // Calculate benefit using actual accuracy improvement over baseline (drift)
        const baselineAccuracy = driftModel
            ? calculateAccuracy(driftModel.mape)
            : undefined;
        const benefit = calculateBenefit(sybilionModel.mae, sybilionModel.mape, adjustParameters, baselineAccuracy);
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
        if (!driftModel)
            return null;
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
        if (!customPerformance)
            return null;
        const accuracy = calculateAccuracy(customPerformance.mape);
        const error = formatError(customPerformance.mae);
        const baselineAccuracy = driftModel
            ? calculateAccuracy(driftModel.mape)
            : undefined;
        const benefit = calculateBenefit(customPerformance.mae, customPerformance.mape, adjustParameters, baselineAccuracy);
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
    return (jsx("div", { className: S.tableSection, children: jsx("div", { className: S.tableWrapper, children: jsx(PageXScroll, { size: "md", fullWidth: true, innerClassName: S.tableContainer, scrollbarClassName: S.scrollbar, children: jsxs(Table, { withPaddings: true, className: S.table, children: [jsx(TableHeader, { children: jsxs(TableRow, { children: [jsx(TableHead, { children: jsxs(TableCellValue, { children: ["Forecast", jsxs(Tooltip, { children: [jsx(TooltipTrigger, { asChild: true, children: jsx("span", { children: jsx(InfoIcon, { size: 16, style: { cursor: 'help' } }) }) }), jsx(TooltipContent, { side: "top", maxWidth: 300, children: "Sybilion AI forecast vs other forecasting methods: MEAN, Seasonal, ARMA, ARIMA, Linear, Theta" })] })] }) }), jsx(TableHead, { children: "Accuracy" }), jsx(TableHead, { children: "Error" }), jsx(TableHead, { children: jsxs(TableCellValue, { children: ["ROI", jsxs(Tooltip, { children: [jsx(TooltipTrigger, { asChild: true, children: jsx("span", { children: jsx(InfoIcon, { size: 16, style: { cursor: 'help' } }) }) }), jsx(TooltipContent, { side: "top", maxWidth: 300, children: "ROI is calculated using default contract annual price." })] })] }) }), jsx(TableHead, { children: jsxs(TableCellValue, { children: ["Benefit p/a", jsxs(Tooltip, { children: [jsx(TooltipTrigger, { asChild: true, children: jsx("span", { children: jsx(InfoIcon, { size: 16, style: { cursor: 'help' } }) }) }), jsx(TooltipContent, { side: "top", maxWidth: 300, children: "Annual Benefit of using Sybilion AI forecast compared to alternative forecasting methods. Calculated using default assumptions: Procurement Volume \u20AC100,000,000 \u00B7 Variable Share 50% \u00B7 Controllable Share 60%" })] })] }) }), showCustomActionsColumn && jsx(TableHead, {})] }) }), jsxs(TableBody, { children: [sybilionRow && (jsx(ModelTableRow, { modelKey: sybilionRow.key, row: jsxs(TableRow, { children: [jsx(TableCell, { children: jsxs("div", { className: S.forecastCell, children: [jsx("span", { className: S.colorCircle, style: { backgroundColor: sybilionRow.color } }), sybilionRow.forecast] }) }), jsx(TableCell, { children: sybilionRow.accuracy }), jsx(TableCell, { children: sybilionRow.error }), jsx(TableCell, { children: sybilionRow.roi }), jsx(TableCell, { children: sybilionRow.benefit }), showCustomActionsColumn && jsx(TableCell, {})] }, sybilionRow.key) })), driftRow && (jsx(ModelTableRow, { modelKey: driftRow.key, row: jsxs(TableRow, { children: [jsx(TableCell, { children: jsxs("div", { className: S.forecastCell, children: [jsx("span", { className: S.colorCircle, style: { backgroundColor: driftRow.color } }), driftRow.forecast] }) }), jsx(TableCell, { children: driftRow.accuracy }), jsx(TableCell, { children: driftRow.error }), jsx(TableCell, { children: driftRow.roi }), jsx(TableCell, { children: driftRow.benefit }), showCustomActionsColumn && jsx(TableCell, {})] }, driftRow.key) })), customRow && (jsx(ModelTableRow, { modelKey: customRow.key, row: jsxs(TableRow, { children: [jsx(TableCell, { children: jsxs("div", { className: S.forecastCell, children: [jsx("span", { className: S.colorCircle, style: { backgroundColor: customRow.color } }), customRow.forecast] }) }), jsx(TableCell, { children: customRow.accuracy }), jsx(TableCell, { children: customRow.error }), jsx(TableCell, { children: customRow.roi }), jsx(TableCell, { children: customRow.benefit }), showCustomActionsColumn && (jsx(TableCell, { children: jsxs(Tooltip, { children: [jsx(TooltipTrigger, { asChild: true, children: jsx(Button, { type: "button", variant: "ghost", icon: true, "aria-label": "Edit custom performance data", onClick: () => onEditCustomPerformance?.(), children: jsx(Pencil, { size: 16 }) }) }), jsx(TooltipContent, { side: "top", children: "Edit custom performance data" })] }) }))] }, customRow.key) })), showAddEditCustomDataButton && !customPerformance && (jsx(TableRow, { className: S.tableCustomDataFooterRow, children: jsx(TableCell, { colSpan: 5 + (showCustomActionsColumn ? 1 : 0), className: S.tableCustomDataFooterCell, children: jsxs(Button, { type: "button", variant: "ghost", size: "sm", disabled: addEditCustomDataDisabled, onClick: () => onEditCustomPerformance?.(), children: [jsx(TableIcon, { size: 16 }), "Add custom data"] }) }) }))] })] }) }) }) }));
}

export { PerformanceTable };
