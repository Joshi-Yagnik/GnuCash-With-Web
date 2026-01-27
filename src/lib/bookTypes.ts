/**
 * Book Model for Multi-Book Architecture
 * Allows users to maintain separate sets of accounts (e.g., Personal, Business)
 */

import { Currency } from "./firebaseTypes";

export interface Book {
    id: string;
    userId: string;
    name: string;
    description?: string;
    defaultCurrency: Currency;
    isDefault: boolean; // One book per user is default
    createdAt: Date;
    updatedAt: Date;

    // Optional: Book-specific settings
    settings?: {
        fiscalYearStart?: string; // e.g., "04-01" for April 1st
        enableReconciliation?: boolean;
        enableBudgets?: boolean;
    };
}

export interface BookMember {
    id: string;
    bookId: string;
    userId: string;
    email: string;
    role: "owner" | "editor" | "viewer";
    invitedAt: Date;
    acceptedAt?: Date;
    invitedBy: string; // userId of inviter
}

export interface BookInvitation {
    id: string;
    bookId: string;
    email: string;
    role: "editor" | "viewer";
    invitedBy: string;
    invitedAt: Date;
    expiresAt: Date;
    status: "pending" | "accepted" | "rejected" | "expired";
}

// Firestore collection paths with book scoping
export const getBookCollectionPath = (bookId: string, collection: string): string => {
    return `books/${bookId}/${collection}`;
};

// Collection names
export const COLLECTIONS = {
    BOOKS: "books",
    ACCOUNTS: "accounts",
    TRANSACTIONS: "transactions",
    SPLITS: "splits",
    CATEGORIES: "categories",
    SCHEDULES: "schedules",
    BUDGETS: "budgets",
} as const;

// Helper to get scoped collection path
export const getAccountsPath = (bookId: string) => getBookCollectionPath(bookId, COLLECTIONS.ACCOUNTS);
export const getTransactionsPath = (bookId: string) => getBookCollectionPath(bookId, COLLECTIONS.TRANSACTIONS);
export const getSplitsPath = (bookId: string) => getBookCollectionPath(bookId, COLLECTIONS.SPLITS);
