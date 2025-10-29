import { useState, useEffect, useCallback } from 'react';

const TRANSITION_DELAY_MS = 100;

export const usePageTransition = (location) => {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [displayLocation, setDisplayLocation] = useState(location);
    const navigateToPage = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setDisplayLocation(location);
            setTimeout(() => {
                setIsTransitioning(false);
            }, 10); 
        }, TRANSITION_DELAY_MS);

    }, [isTransitioning, location]);

    useEffect(() => {
        if (location.pathname !== displayLocation.pathname) {
            navigateToPage();
        } else if (isTransitioning) {
            setIsTransitioning(false);
        }
    }, [location, displayLocation.pathname, isTransitioning, navigateToPage]);

    return {
        displayLocation,
        isTransitioning,
        isEntering: !isTransitioning,
        key: displayLocation.pathname,
        navigateToPage,
    };
};
