import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current device is mobile based on screen width
 * Uses 768px (md breakpoint) as the threshold
 */
export function useMobileDetect() {
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);
        };

        // Check on mount
        checkDevice();

        // Check on resize
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    return { isMobile, isTablet, isDesktop: !isMobile && !isTablet };
}

/**
 * Hook to detect if the device supports touch
 */
export function useTouchDetect() {
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    return isTouch;
}
