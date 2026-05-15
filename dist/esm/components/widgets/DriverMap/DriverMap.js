import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import useEvent from '../../../hooks/useEvent.js';
import { Shimmer } from '@homecode/ui';
import { DriverIcon } from './DriverIcon/DriverIcon.js';
import constants from './DriverIcon/DriverIcon.constants.json.js';
import { findMostSpecificRegion, getDriverCoordinates, hasValidCoords, calculateBadgeSizes } from './DriverMap.helpers.js';
import S from './DriverMap.styl.js';
import { MapBackground } from './MapBackground/MapBackground.js';
import { getHighestImportanceDriver } from './driverMapSelection.js';

const delay = (ms) => new Promise(r => setTimeout(r, ms));
const transitionDelay = () => delay(constants.FADE_DURATION);
function DriverMap({ drivers, isLoading, setSelectedDriver, selectedDriver, }) {
    const visibleDriversRef = useRef([]);
    const [showingDrivers, setShowingDrivers] = useState(drivers);
    const [badgeSizes, setBadgeSizes] = useState({});
    const [isVisible, setIsVisible] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const makeTransition = async (nextDrivers) => {
        const hadDrivers = showingDrivers.length > 0;
        setIsTransitioning(true);
        if (hadDrivers) {
            setIsVisible(false);
            await transitionDelay();
        }
        if (nextDrivers.length > 0) {
            setShowingDrivers(nextDrivers);
            setIsVisible(false);
            const sizes = calculateBadgeSizes(nextDrivers);
            setBadgeSizes(sizes);
            await delay(30);
            setIsVisible(true);
            await transitionDelay();
        }
        else {
            setShowingDrivers([]);
            setBadgeSizes({});
            setIsVisible(false);
        }
        setIsTransitioning(false);
    };
    const [worldDrivers, otherDrivers] = useMemo(() => {
        const visibleDrivers = [];
        const worldDriversList = [];
        drivers.forEach(driver => {
            let importance = driver.importance || 0;
            if (importance === 0) {
                const mean = driver?.rawImportance?.overall?.mean;
                if (typeof mean === 'number') {
                    importance = Math.abs(mean) * 100;
                }
            }
            const specificRegion = findMostSpecificRegion(driver);
            const isEmptyRegion = driver.region?.length === 0;
            const isWorldRegion = specificRegion.name === 'World' ||
                driver.region?.slice(-1)[0] === 'World';
            const coordinates = getDriverCoordinates(driver, specificRegion, visibleDrivers);
            const driverToAdd = {
                ...driver,
                coordinates,
            };
            const shouldGoToWorldDrivers = isWorldRegion ||
                !hasValidCoords(driverToAdd.coordinates) ||
                (isEmptyRegion && !specificRegion.name);
            if (shouldGoToWorldDrivers && importance >= 0) {
                worldDriversList.push(driver);
            }
            else if (hasValidCoords(driverToAdd.coordinates) && importance >= 0) {
                visibleDrivers.push(driverToAdd);
            }
        });
        return [
            worldDriversList.sort((a, b) => b.importance - a.importance),
            visibleDrivers,
        ];
    }, [drivers]);
    useEffect(() => {
        void makeTransition(drivers);
        if (drivers.length > 0) {
            const idx = getHighestImportanceDriver(drivers);
            if (idx !== null && idx >= 0) {
                setSelectedDriver(drivers[idx]);
            }
        }
    }, [drivers]);
    useEffect(() => {
        visibleDriversRef.current = otherDrivers;
    }, [otherDrivers]);
    const handleKeyDown = useCallback((e) => {
        const items = visibleDriversRef.current;
        if (!selectedDriver || items.length === 0 || e.metaKey || e.ctrlKey)
            return;
        const stop = () => {
            e.preventDefault();
            e.stopPropagation();
        };
        const currIndex = items.findIndex(d => d.id === selectedDriver.id);
        if (e.key === 'ArrowLeft') {
            const prevIndex = currIndex > 0 ? currIndex - 1 : items.length - 1;
            setSelectedDriver(items[prevIndex]);
            stop();
        }
        else if (e.key === 'ArrowRight') {
            const nextIndex = currIndex < items.length - 1 ? currIndex + 1 : 0;
            setSelectedDriver(items[nextIndex]);
            stop();
        }
    }, [selectedDriver, setSelectedDriver]);
    useEvent({
        event: 'keydown',
        callback: handleKeyDown,
        isCapture: true,
    });
    return (jsxs("div", { className: cn(S.root, isTransitioning && S.inTransition), children: [jsxs("div", { className: S.mapInner, children: [jsx(MapBackground, {}), isLoading && jsx(Shimmer, { className: S.shimmerOverlay, size: "l" }), otherDrivers.map(driver => (jsx(DriverIcon, { isLoading: isLoading, isVisible: isVisible, driver: driver, size: badgeSizes[driver.id] || 's', isSelected: selectedDriver?.id === driver.id, onClick: () => setSelectedDriver(driver) }, driver.id)))] }), jsx("div", { className: S.worldDrivers, children: worldDrivers.map(driver => {
                    const driverWithCoords = {
                        ...driver,
                        coordinates: driver.coordinates || {
                            x: 0,
                            y: 0,
                            continent: 'Global',
                        },
                    };
                    return (jsx(DriverIcon, { isLoading: isLoading, isVisible: isVisible, driver: driverWithCoords, size: badgeSizes[driver.id] || 's', isSelected: selectedDriver?.id === driver.id, onClick: () => setSelectedDriver(driver) }, driver.id));
                }) })] }));
}

export { DriverMap };
