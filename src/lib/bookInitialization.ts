/**
 * Book Initialization - Creates default accounts and categories for new books
 * This module handles populating a new book with starter data
 */

import db from "@/lib/database/DatabaseService";
import {
    DEFAULT_ACCOUNTS,
    DEFAULT_INCOME_CATEGORIES,
    DEFAULT_EXPENSE_CATEGORIES,
} from "./defaultData";

/**
 * Initialize a book with default accounts and categories
 * Called when a new book is created (either first book for new user, or additional books)
 * 
 * @param bookId - ID of the book to initialize
 * @returns Promise that resolves when initialization is complete
 */
export async function initializeBookDefaults(bookId: string): Promise<void> {
    console.log(`Initializing book ${bookId} with default data...`);

    // Helper to ignore errors for individual items to ensure partial success
    const safeCreate = async (operation: Promise<void>, name: string) => {
        try {
            await operation;
            console.log(`Created: ${name}`);
        } catch (error) {
            console.warn(`Failed to create ${name}:`, error);
            // We continue even if one item fails
        }
    };

    try {
        // Create default accounts
        for (const accountData of DEFAULT_ACCOUNTS) {
            await safeCreate(db.createAccount(bookId, accountData), `account ${accountData.name}`);
        }

        // Create default income categories
        for (const categoryData of DEFAULT_INCOME_CATEGORIES) {
            await safeCreate(db.createCategory(bookId, categoryData), `category ${categoryData.name}`);
        }

        // Create default expense categories
        for (const categoryData of DEFAULT_EXPENSE_CATEGORIES) {
            await safeCreate(db.createCategory(bookId, categoryData), `category ${categoryData.name}`);
        }

        console.log(`✅ Book ${bookId} initialization process completed`);
    } catch (error) {
        console.error(`❌ Critical error during book ${bookId} initialization (partial data may exist):`, error);
        // We do NOT throw here, so the book creation is considered successful by the UI
    }
}

/**
 * Check if a book has been initialized with default data
 * @param bookId - ID of the book to check
 * @returns true if book has accounts, false otherwise
 */
export async function isBookInitialized(bookId: string): Promise<boolean> {
    try {
        const accounts = await db.getBookAccounts(bookId);
        return accounts.length > 0;
    } catch (error) {
        console.error(`Error checking if book ${bookId} is initialized:`, error);
        return false;
    }
}
