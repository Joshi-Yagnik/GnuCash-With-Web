export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    defaultCurrency?: string; // Default currency preference (INR)
    isInitialized: boolean; // Tracks if default data has been created
    createdAt: Date;
    updatedAt: Date;
}
