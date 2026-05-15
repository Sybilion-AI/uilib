import { jsx, jsxs } from 'react/jsx-runtime';
import React__default, { useMemo } from 'react';
import { CoffeeIcon, TrendUpIcon, TrendDownIcon } from '@phosphor-icons/react';
import { Badge } from '../../ui/Badge/Badge.js';
import { Card, CardContent } from '../../ui/Card/Card.js';
import { LabelWithId } from '../../ui/LabelWithId/LabelWithId.js';
import { Skeleton } from '../../ui/Skeleton/Skeleton.js';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../ui/Tooltip/Tooltip.js';
import { getCategoryIcon } from '../DriverMap/driverCategoryIcon.js';
import S from './DriverCard.styl.js';
import { DriverPerformanceChart } from './DriverPerformanceChart.js';

function DriverCard({ selectedDriver, isLoading, inQueue = false, driverSelector, }) {
    const importanceDisplay = useMemo(() => {
        if (!selectedDriver)
            return '';
        let importance = 0;
        if (selectedDriver.rawImportance &&
            typeof selectedDriver.rawImportance === 'object') {
            const importanceObj = selectedDriver.rawImportance;
            if (importanceObj.overall && typeof importanceObj.overall === 'object') {
                const overall = importanceObj.overall;
                if (typeof overall.mean === 'number') {
                    importance = Math.round(overall.mean);
                }
            }
        }
        return importance > 0
            ? `${importance}%`
            : `${selectedDriver.importance.toFixed(1)}%`;
    }, [selectedDriver]);
    const regionDisplay = React__default.useMemo(() => {
        if (!selectedDriver)
            return '';
        // Check for src_region and tgt_region properties first
        const driver = selectedDriver;
        const srcRegion = driver.src_region;
        const tgtRegion = driver.tgt_region;
        const srcName = srcRegion?.name;
        const tgtName = tgtRegion?.name;
        // If both src_region and tgt_region have valid names
        if (srcName && tgtName) {
            // If source and target are the same, just show one
            if (srcName === tgtName) {
                return srcName;
            }
            return `${srcName} → ${tgtName}`;
        }
        // If only src_region has a valid name
        if (srcName) {
            if (srcName === 'World') {
                return 'World';
            }
            return `${srcName} → World`;
        }
        // If only tgt_region has a valid name
        if (tgtName) {
            if (tgtName === 'World') {
                return 'World';
            }
            return `World → ${tgtName}`;
        }
        if (selectedDriver.region.length === 1)
            return selectedDriver.region[0];
        if (selectedDriver.region.length > 1) {
            return (selectedDriver.region
                // .filter(region => region !== 'World')
                .join(' → '));
        }
        // Fallback to "World" when no region information is available
        return 'World';
    }, [selectedDriver]);
    if (inQueue) {
        return (jsx(Card, { className: S.root, children: jsx(CardContent, { centered: true, fullHeight: true, noScroll: true, children: jsxs("div", { className: S.queueMessage, children: [jsx(CoffeeIcon, { size: 24, weight: "regular" }), jsxs("div", { children: [jsx("p", { children: "Retrieving drivers data." }), jsx("p", { children: "This may take a while." })] })] }) }) }));
    }
    if (isLoading) {
        return (jsx(Card, { className: S.root, children: jsx(CardContent, { noScroll: true, children: jsxs("div", { className: S.skeletonContainer, children: [jsx(Skeleton, { className: `${S.skeletonItem} ${S.hs} ${S.w75}` }), jsx(Skeleton, { className: `${S.skeletonItem} ${S.hm} ${S.w50}` }), jsx(Skeleton, { className: `${S.skeletonItem} ${S.hs} ${S.w33}` }), jsxs("div", { className: S.skeletonGroup, children: [jsx(Skeleton, { className: `${S.skeletonItem} ${S.hs} ${S.wFull}` }), jsx(Skeleton, { className: `${S.skeletonItem} ${S.hs} ${S.w75}` }), jsx(Skeleton, { className: `${S.skeletonItem} ${S.hs} ${S.w50}` })] }), jsx(Skeleton, { className: `${S.skeletonItem} ${S.hl} ${S.wFull}` }), jsxs("div", { className: S.skeletonGroup, children: [jsx(Skeleton, { className: `${S.skeletonItem} ${S.hs} ${S.wFull}` }), jsx(Skeleton, { className: `${S.skeletonItem} ${S.hs} ${S.w75}` })] })] }) }) }));
    }
    if (!selectedDriver) {
        return (jsx(Card, { className: S.root, children: jsx(CardContent, { centered: true, fullHeight: true, noScroll: true, children: jsx("span", { className: S.noDriverSelected, children: "No driver selected" }) }) }));
    }
    const { id, name, category, direction, lag, summary } = selectedDriver;
    const directionText = direction > 0 ? 'Positive' : 'Negative';
    const DirectionIcon = direction > 0 ? TrendUpIcon : TrendDownIcon;
    const nameElem = (jsx("h4", { className: `${S.driverTitle} ${S.truncated}`, children: name }));
    return (jsx(Card, { className: S.root, paddingSize: "l", children: jsx(CardContent, { noScroll: true, children: jsxs("div", { className: S.cardContent, children: [jsx("div", { className: S.driverHeader, children: jsxs("div", { className: S.headerContent, children: [jsxs("div", { className: S.topHeader, children: [jsxs("p", { className: S.categoryInfo, children: [jsx("span", { className: S.categoryIcon, children: getCategoryIcon(category) }), jsx("span", { className: S.categoryText, children: category })] }), driverSelector] }), name.length > 60 ? (jsxs(Tooltip, { children: [jsx(LabelWithId, { id: id, label: jsx(TooltipTrigger, { asChild: true, children: nameElem }) }), jsx(TooltipContent, { side: "left", className: S.tooltipContent, children: jsx("div", { className: S.tooltipTitle, children: name }) })] })) : (jsx(LabelWithId, { id: id, label: nameElem })), jsx("p", { className: S.regionDisplay, children: regionDisplay })] }) }), jsx("div", { className: S.metricsSection, children: jsx("div", { className: S.importanceScore, children: importanceDisplay }) }), jsxs("div", { className: S.directionLagSection, children: [jsxs(Badge, { variant: direction > 0 ? 'green' : 'red', className: S.directionBadge, children: [jsx(DirectionIcon, { className: S.trendIcon }), directionText, " correlation"] }), jsxs("span", { className: S.lagInfo, children: ["Lag: ", lag] })] }), jsx(DriverPerformanceChart, { driver: selectedDriver }), jsx("p", { className: S.description, children: summary ?? '' })] }) }) }));
}

export { DriverCard };
