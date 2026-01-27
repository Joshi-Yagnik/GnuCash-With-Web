import { useState, useEffect } from "react";
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useFavoriteAccounts() {
    const { user } = useAuth();
    const [favoriteAccountIds, setFavoriteAccountIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setFavoriteAccountIds([]);
            setLoading(false);
            return;
        }

        const loadFavorites = async () => {
            try {
                const favoritesRef = doc(db, "userPreferences", user.uid);
                const favoritesSnap = await getDoc(favoritesRef);

                if (favoritesSnap.exists()) {
                    const data = favoritesSnap.data();
                    setFavoriteAccountIds(data.favoriteAccounts || []);
                }
            } catch (error) {
                console.error("Error loading favorites:", error);
            } finally {
                setLoading(false);
            }
        };

        loadFavorites();
    }, [user]);

    const toggleFavorite = async (accountId: string) => {
        if (!user) {
            console.error("Toggle favorite failed: No user authenticated");
            toast.error("Please log in to use favorites");
            return;
        }

        try {
            const isFavorite = favoriteAccountIds.includes(accountId);
            const newFavorites = isFavorite
                ? favoriteAccountIds.filter((id) => id !== accountId)
                : [...favoriteAccountIds, accountId];

            // Update local state immediately for better UX
            setFavoriteAccountIds(newFavorites);

            // Update Firestore
            const favoritesRef = doc(db, "userPreferences", user.uid);
            console.log("Updating favorites for user:", user.uid);
            console.log("New favorites:", newFavorites);

            const favoritesSnap = await getDoc(favoritesRef);

            if (favoritesSnap.exists()) {
                console.log("Updating existing preferences document");
                await updateDoc(favoritesRef, {
                    favoriteAccounts: newFavorites,
                    updatedAt: new Date(),
                });
            } else {
                console.log("Creating new preferences document");
                await setDoc(favoritesRef, {
                    userId: user.uid,
                    favoriteAccounts: newFavorites,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

            console.log("Favorites updated successfully");
            toast.success(
                isFavorite
                    ? "Removed from favorites"
                    : "Added to favorites"
            );
        } catch (error: any) {
            console.error("Error toggling favorite - Full error:", error);
            console.error("Error code:", error?.code);
            console.error("Error message:", error?.message);

            // Specific error messages based on Firebase error codes
            let errorMessage = "Failed to update favorite";
            if (error?.code === "permission-denied") {
                errorMessage = "Permission denied. Please check Firestore rules.";
                console.error("Firestore rules need to allow writes to userPreferences collection");
            } else if (error?.code === "unavailable") {
                errorMessage = "Network error. Please check your connection.";
            }

            toast.error(errorMessage);
            // Revert local state on error
            setFavoriteAccountIds(favoriteAccountIds);
        }
    };

    const isFavorite = (accountId: string) => {
        return favoriteAccountIds.includes(accountId);
    };

    return {
        favoriteAccountIds,
        toggleFavorite,
        isFavorite,
        loading,
    };
}
