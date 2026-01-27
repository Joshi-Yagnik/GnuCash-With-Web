import { User } from "firebase/auth";
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Check if a user has been initialized with profile
 */
export async function isUserInitialized(userId: string): Promise<boolean> {
    const profileRef = doc(db, "users", userId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
        return false;
    }

    const data = profileSnap.data();
    return data.isInitialized === true;
}

/**
 * Initialize a new user with profile document
 * 
 * NOTE: This function ONLY creates the user profile.
 * Default accounts and categories are created by BookContext
 * when the default book is initialized.
 * 
 * @param user - Firebase Auth user object
 * @param displayName - Optional display name override
 */
export async function initializeNewUser(
    user: User,
    displayName?: string
): Promise<void> {
    // Check if already initialized to prevent duplicates
    const initialized = await isUserInitialized(user.uid);
    if (initialized) {
        console.log("User already initialized, skipping profile creation...");
        return;
    }

    console.log("Creating user profile for new user:", user.uid);

    // Create user profile document
    const profileRef = doc(db, "users", user.uid);
    await setDoc(profileRef, {
        uid: user.uid,
        email: user.email || "",
        displayName: displayName || user.displayName || user.email?.split("@")[0] || "User",
        photoURL: user.photoURL || null,
        isInitialized: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    console.log("✅ User profile created successfully");
    console.log("ℹ️  Default book and data will be created by BookContext");
}

/**
 * Update existing user profile with isInitialized flag
 * (For migration of existing users if needed)
 */
export async function markUserAsInitialized(userId: string): Promise<void> {
    const profileRef = doc(db, "users", userId);

    await setDoc(profileRef, {
        isInitialized: true,
        updatedAt: serverTimestamp(),
    }, { merge: true });

    console.log("User marked as initialized:", userId);
}
