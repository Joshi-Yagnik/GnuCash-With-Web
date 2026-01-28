/**
 * Check if current viewport is mobile size
 */
export const isMobileViewport = (): boolean => {
    return window.innerWidth < 768;
};

/**
 * Check if current viewport is tablet size
 */
export const isTabletViewport = (): boolean => {
    return window.innerWidth >= 768 && window.innerWidth < 1024;
};

/**
 * Check if current viewport is desktop size
 */
export const isDesktopViewport = (): boolean => {
    return window.innerWidth >= 1024;
};

/**
 * Check if device has touch support
 */
export const isTouchDevice = (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Get viewport height accounting for mobile browser chrome
 */
export const getViewportHeight = (): number => {
    return window.innerHeight;
};

/**
 * Prevent body scroll (useful for modals on mobile)
 */
export const disableBodyScroll = (): void => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
};

/**
 * Re-enable body scroll
 */
export const enableBodyScroll = (): void => {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
};

/**
 * Scroll element into view with mobile-friendly behavior
 */
export const scrollIntoViewMobile = (element: HTMLElement): void => {
    if (isMobileViewport()) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};
