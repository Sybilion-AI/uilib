import { Card, CardContent } from '../../ui/Card';
import { CoffeeIcon, TrendDownIcon, TrendUpIcon } from '@phosphor-icons/react';
import React, { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/Tooltip';

import { Badge } from '../../ui/Badge';
import type { DriverData } from '../DriverMap/driverMapGeography';
import { DriverPerformanceChart } from './DriverPerformanceChart';
import { LabelWithId } from '../../ui/LabelWithId';
import S from './DriverCard.styl';
import { Skeleton } from '../../ui/Skeleton';
import { getCategoryIcon } from '../DriverMap/driverCategoryIcon';

export interface DriverCardProps {
  selectedDriver: DriverData | null;
  isLoading: boolean;
  inQueue?: boolean;
  driverSelector?: React.ReactNode;
}

export function DriverCard({
  selectedDriver,
  isLoading,
  inQueue = false,
  driverSelector,
}: DriverCardProps) {
  const importanceDisplay = useMemo(() => {
    if (!selectedDriver) return '';

    let importance = 0;
    if (
      selectedDriver.rawImportance &&
      typeof selectedDriver.rawImportance === 'object'
    ) {
      const importanceObj = selectedDriver.rawImportance as any;
      if (importanceObj.overall && typeof importanceObj.overall === 'object') {
        const overall = importanceObj.overall as any;
        if (typeof overall.mean === 'number') {
          importance = Math.round(overall.mean);
        }
      }
    }

    return importance > 0
      ? `${importance}%`
      : `${selectedDriver.importance.toFixed(1)}%`;
  }, [selectedDriver]);

  const regionDisplay = React.useMemo(() => {
    if (!selectedDriver) return '';

    // Check for src_region and tgt_region properties first
    const driver = selectedDriver as any;
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

    if (selectedDriver.region.length === 1) return selectedDriver.region[0];

    if (selectedDriver.region.length > 1) {
      return (
        selectedDriver.region
          // .filter(region => region !== 'World')
          .join(' → ')
      );
    }

    // Fallback to "World" when no region information is available
    return 'World';
  }, [selectedDriver]);

  if (inQueue) {
    return (
      <Card className={S.root}>
        <CardContent centered fullHeight noScroll>
          <div className={S.queueMessage}>
            <CoffeeIcon size={24} weight="regular" />
            <div>
              <p>Retrieving drivers data.</p>
              <p>This may take a while.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={S.root} radiusSize="xl">
        <CardContent noScroll>
          <div className={S.skeletonContainer}>
            <Skeleton className={`${S.skeletonItem} ${S.hs} ${S.w75}`} />
            <Skeleton className={`${S.skeletonItem} ${S.hm} ${S.w50}`} />
            <Skeleton className={`${S.skeletonItem} ${S.hs} ${S.w33}`} />
            <div className={S.skeletonGroup}>
              <Skeleton className={`${S.skeletonItem} ${S.hs} ${S.wFull}`} />
              <Skeleton className={`${S.skeletonItem} ${S.hs} ${S.w75}`} />
              <Skeleton className={`${S.skeletonItem} ${S.hs} ${S.w50}`} />
            </div>
            <Skeleton className={`${S.skeletonItem} ${S.hl} ${S.wFull}`} />
            <div className={S.skeletonGroup}>
              <Skeleton className={`${S.skeletonItem} ${S.hs} ${S.wFull}`} />
              <Skeleton className={`${S.skeletonItem} ${S.hs} ${S.w75}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedDriver) {
    return (
      <Card className={S.root}>
        <CardContent centered fullHeight noScroll>
          <span className={S.noDriverSelected}>No driver selected</span>
        </CardContent>
      </Card>
    );
  }

  const { id, name, category, direction, lag, summary } = selectedDriver;
  const directionText = direction > 0 ? 'Positive' : 'Negative';
  const DirectionIcon = direction > 0 ? TrendUpIcon : TrendDownIcon;

  const nameElem = (
    <h4 className={`${S.driverTitle} ${S.truncated}`}>{name}</h4>
  );

  return (
    <Card className={S.root} paddingSize="l" radiusSize="xl">
      <CardContent noScroll>
        <div className={S.cardContent}>
          {/* Driver Header */}
          <div className={S.driverHeader}>
            <div className={S.headerContent}>
              <div className={S.topHeader}>
                <p className={S.categoryInfo}>
                  <span className={S.categoryIcon}>
                    {getCategoryIcon(category)}
                  </span>
                  <span className={S.categoryText}>{category}</span>
                </p>

                {driverSelector}
              </div>
              {name.length > 60 ? (
                <Tooltip>
                  <LabelWithId
                    id={id}
                    label={<TooltipTrigger asChild>{nameElem}</TooltipTrigger>}
                  />
                  <TooltipContent
                    side="left"
                    className={S.tooltipContent}
                    overTrigger
                  >
                    <div className={S.tooltipTitle}>{name}</div>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <LabelWithId id={id} label={nameElem} />
              )}

              <p className={S.regionDisplay}>{regionDisplay}</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className={S.metricsSection}>
            <div className={S.importanceScore}>{importanceDisplay}</div>
          </div>

          {/* Direction and Lag Information */}
          <div className={S.directionLagSection}>
            <Badge
              variant={direction > 0 ? 'green' : 'red'}
              className={S.directionBadge}
            >
              <DirectionIcon className={S.trendIcon} />
              {directionText} correlation
            </Badge>

            <span className={S.lagInfo}>Lag: {lag}</span>
          </div>

          {/* Driver Performance Chart */}
          <DriverPerformanceChart driver={selectedDriver} />

          {/* Description */}
          <p className={S.description}>{summary ?? ''}</p>
        </div>
      </CardContent>
    </Card>
  );
}
