// Defines backend types for future settings features even if UI is not ready

export interface UserPreferences {
    userId: string;

    // Regional
    currency: string;      // ISO code, e.g. "INR", "USD"
    dateFormat: string;    // e.g. "DD/MM/YYYY"
    numberFormat: 'indian' | 'international';
    language: string;      // e.g. "en"

    // Theme
    themeMode: 'light' | 'dark' | 'system';
    accentColor?: string;

    // Notification (future)
    emailNotifications: boolean;

    // Meta
    updatedAt: Date;
}

export const DEFAULT_PREFERENCES: Omit<UserPreferences, 'userId' | 'updatedAt'> = {
    currency: 'INR',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'indian',
    language: 'en',
    themeMode: 'system',
    emailNotifications: true
};
