/**
 * User Settings Hook
 * Manages application-wide user preferences
 */

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Currency } from "@/lib/firebaseTypes";
import { toast } from "sonner";

export interface UserSettings {
    // Preferences
    defaultCurrency: Currency;
    dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
    numberFormat: "1,234.56" | "1.234,56" | "1 234,56";
    language: "en" | "hi" | "es" | "fr";

    // Theme
    theme: "light" | "dark" | "auto";
    accentColor: string;
    compactMode: boolean;

    // Notifications
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyReport: boolean;

    // Privacy
    shareAnalytics: boolean;

    // Display
    showAccountNumbers: boolean;
    showZeroBalances: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
    defaultCurrency: "INR",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    language: "en",
    theme: "auto",
    accentColor: "#10b981",
    compactMode: false,
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    shareAnalytics: false,
    showAccountNumbers: true,
    showZeroBalances: true,
};

export function useSettings() {
    const { user } = useAuth();
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setSettings(DEFAULT_SETTINGS);
            setLoading(false);
            return;
        }

        loadSettings();
    }, [user]);

    const loadSettings = async () => {
        if (!user) return;

        try {
            const settingsRef = doc(db, "userPreferences", user.uid);
            const settingsSnap = await getDoc(settingsRef);

            if (settingsSnap.exists()) {
                const data = settingsSnap.data();
                setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
            } else {
                // Create default settings
                await setDoc(settingsRef, {
                    userId: user.uid,
                    settings: DEFAULT_SETTINGS,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }
        } catch (error) {
            console.error("Error loading settings:", error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const updateSettings = async (updates: Partial<UserSettings>) => {
        if (!user) return;

        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);

        try {
            const settingsRef = doc(db, "userPreferences", user.uid);
            await updateDoc(settingsRef, {
                settings: newSettings,
                updatedAt: new Date(),
            });

            toast.success("Settings updated");
        } catch (error) {
            console.error("Error updating settings:", error);
            toast.error("Failed to update settings");
            // Revert on error
            setSettings(settings);
        }
    };

    const resetSettings = async () => {
        if (!user) return;

        setSettings(DEFAULT_SETTINGS);

        try {
            const settingsRef = doc(db, "userPreferences", user.uid);
            await updateDoc(settingsRef, {
                settings: DEFAULT_SETTINGS,
                updatedAt: new Date(),
            });

            toast.success("Settings reset to defaults");
        } catch (error) {
            console.error("Error resetting settings:", error);
            toast.error("Failed to reset settings");
        }
    };

    return {
        settings,
        loading,
        updateSettings,
        resetSettings,
    };
}
