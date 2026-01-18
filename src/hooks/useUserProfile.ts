import { useState, useEffect, useCallback } from "react";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot,
    Timestamp,
    serverTimestamp,
} from "firebase/firestore";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile } from "@/lib/userProfileTypes";
import { initializeNewUser } from "@/lib/userInitialization";

export function useUserProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [initializing, setInitializing] = useState(false);

    // Subscribe to user profile in Firestore and initialize if needed
    useEffect(() => {
        if (!user) {
            setProfile(null);
            setLoading(false);
            return;
        }

        const profileRef = doc(db, "users", user.uid);
        let unsubscribe: (() => void) | null = null;

        const setupProfile = async () => {
            try {
                // Check if profile exists
                const profileSnap = await getDoc(profileRef);

                if (!profileSnap.exists()) {
                    // New user - initialize with default data
                    console.log("New user detected, initializing...");
                    setInitializing(true);
                    await initializeNewUser(user);
                    setInitializing(false);
                }

                // Subscribe to profile updates
                unsubscribe = onSnapshot(
                    profileRef,
                    (snapshot) => {
                        if (snapshot.exists()) {
                            const data = snapshot.data();
                            setProfile({
                                uid: snapshot.id,
                                email: data.email,
                                displayName: data.displayName,
                                photoURL: data.photoURL,
                                isInitialized: data.isInitialized ?? false,
                                createdAt: data.createdAt?.toDate() || new Date(),
                                updatedAt: data.updatedAt?.toDate() || new Date(),
                            });
                        } else {
                            setProfile(null);
                        }
                        setLoading(false);
                    },
                    (err) => {
                        console.error("Error fetching profile:", err);
                        setError(err.message);
                        setLoading(false);
                        setInitializing(false);
                    }
                );
            } catch (err: any) {
                console.error("Error setting up profile:", err);
                setError(err.message);
                setLoading(false);
                setInitializing(false);
            }
        };

        setupProfile();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user]);

    // Create initial profile
    const createProfile = useCallback(
        async (displayName: string, photoURL?: string) => {
            if (!user) throw new Error("No user logged in");

            const profileData = {
                uid: user.uid,
                email: user.email || "",
                displayName,
                photoURL: photoURL || null,
                isInitialized: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            await setDoc(doc(db, "users", user.uid), profileData);
        },
        [user]
    );

    // Update profile
    const updateProfile = useCallback(
        async (updates: Partial<Pick<UserProfile, "displayName" | "photoURL">>) => {
            if (!user) throw new Error("No user logged in");

            await updateDoc(doc(db, "users", user.uid), {
                ...updates,
                updatedAt: serverTimestamp(),
            });
        },
        [user]
    );

    // Upload profile photo
    const uploadProfilePhoto = useCallback(
        async (file: File, onProgress?: (progress: number) => void): Promise<string> => {
            if (!user) throw new Error("No user logged in");

            // Validate file
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                throw new Error("File size must be less than 5MB");
            }

            const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
            if (!allowedTypes.includes(file.type)) {
                throw new Error("Only JPG, PNG, and WebP images are allowed");
            }

            // Resize and compress image
            const resizedFile = await resizeImage(file, 400, 400);

            // Upload to storage
            const timestamp = Date.now();
            const fileName = `${timestamp}.jpg`;
            const storageRef = ref(storage, `users/${user.uid}/profile-photos/${fileName}`);

            try {
                // Upload the file
                const snapshot = await uploadBytes(storageRef, resizedFile);

                // Get download URL
                const downloadURL = await getDownloadURL(snapshot.ref);

                // Update profile with new photo URL
                await updateProfile({ photoURL: downloadURL });

                return downloadURL;
            } catch (error: any) {
                console.error("Error uploading photo:", error);
                throw new Error("Failed to upload photo. Please try again.");
            }
        },
        [user, updateProfile]
    );

    // Delete profile photo
    const deleteProfilePhoto = useCallback(
        async () => {
            if (!user || !profile?.photoURL) return;

            try {
                // Extract file path from URL
                const photoURL = profile.photoURL;
                const filePath = decodeURIComponent(
                    photoURL.split("/o/")[1]?.split("?")[0] || ""
                );

                if (filePath) {
                    const photoRef = ref(storage, filePath);
                    await deleteObject(photoRef);
                }

                // Update profile to remove photo URL
                await updateProfile({ photoURL: undefined });
            } catch (error: any) {
                console.error("Error deleting photo:", error);
                throw new Error("Failed to delete photo. Please try again.");
            }
        },
        [user, profile, updateProfile]
    );

    return {
        profile,
        loading,
        error,
        initializing,
        createProfile,
        updateProfile,
        uploadProfilePhoto,
        deleteProfilePhoto,
    };
}

// Helper function to resize image
async function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions (maintain aspect ratio)
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }

            // Set canvas size
            canvas.width = width;
            canvas.height = height;

            // Draw image on canvas
            ctx?.drawImage(img, 0, 0, width, height);

            // Convert to blob
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Failed to resize image"));
                    }
                },
                "image/jpeg",
                0.85 // 85% quality
            );
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = URL.createObjectURL(file);
    });
}
