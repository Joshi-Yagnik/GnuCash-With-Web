import { User } from "firebase/auth";
import {
    doc,
    getDoc,
    writeBatch,
    collection,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import {
    DEFAULT_ACCOUNTS,
    DEFAULT_INCOME_CATEGORIES,
    DEFAULT_EXPENSE_CATEGORIES,
} from "./defaultData";

/**
 * Check if a user has been initialized with profile and default data
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
 * Initialize a new user with profile and default data
 * Creates:
 * - User profile document
 * - Default asset accounts (Cash, Bank, Savings)
 * - Default income categories
 * - Default expense categories
 *
 * Uses batch writes for atomicity (all-or-nothing)
 */
export async function initializeNewUser(
    user: User,
    displayName?: string
): Promise<void> {
    // Check if already initialized to prevent duplicates
    const initialized = await isUserInitialized(user.uid);
    if (initialized) {
        console.log("User already initialized, skipping...");
        return;
    }

    const batch = writeBatch(db);
    const now = serverTimestamp();

    // 1. Create user profile
    const profileRef = doc(db, "users", user.uid);
    batch.set(profileRef, {
        uid: user.uid,
        email: user.email || "",
        displayName: displayName || user.displayName || user.email?.split("@")[0] || "User",
        photoURL: user.photoURL || null,
        isInitialized: true,
        createdAt: now,
        updatedAt: now,
    });

    // 2. Create default accounts
    DEFAULT_ACCOUNTS.forEach((accountData) => {
        const accountRef = doc(collection(db, "accounts"));
        batch.set(accountRef, {
            ...accountData,
            userId: user.uid,
            createdAt: now,
            updatedAt: now,
        });
    });

    // 3. Create default income categories
    DEFAULT_INCOME_CATEGORIES.forEach((categoryData) => {
        const categoryRef = doc(collection(db, "categories"));
        batch.set(categoryRef, {
            ...categoryData,
            userId: user.uid,
        });
    });

    // 4. Create default expense categories
    DEFAULT_EXPENSE_CATEGORIES.forEach((categoryData) => {
        const categoryRef = doc(collection(db, "categories"));
        batch.set(categoryRef, {
            ...categoryData,
            userId: user.uid,
        });
    });

    // Commit all changes atomically
    await batch.commit();
    console.log("User initialized successfully with default data");
}

/**
 * Update existing user profile with isInitialized flag
 * (For migration of existing users if needed)
 */
export async function markUserAsInitialized(userId: string): Promise<void> {
    const batch = writeBatch(db);
    const profileRef = doc(db, "users", userId);

    batch.update(profileRef, {
        isInitialized: true,
        updatedAt: serverTimestamp(),
    });

    await batch.commit();
}
