/**
 * Database Middleware Type Definitions
 * Abstracts database operations to support multiple backends (Firebase, MongoDB, etc.)
 */

import { Account, Transaction, Split, Category, Budget, RecurringTransaction, Tag } from "@/lib/firebaseTypes";
import { Book } from "@/lib/bookTypes";

// Generic query filter
export interface QueryFilter {
    field: string;
    operator: "==" | "!=" | ">" | ">=" | "<" | "<=" | "in" | "array-contains";
    value: any;
}


// Query options
export interface QueryOptions {
    filters?: QueryFilter[];
    orderBy?: { field: string; direction: "asc" | "desc" }[];
    limit?: number;
    startAfter?: any;
}

// Real-time subscription callback
export type SubscriptionCallback<T> = (data: T[]) => void;
export type UnsubscribeFunction = () => void;

/**
 * Abstract Database Adapter Interface
 * All database implementations must implement this interface
 */
export abstract class DatabaseAdapter {
    abstract isConnected(): boolean;

    // Connection management
    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;

    // Generic CRUD operations
    abstract create<T>(collection: string, id: string, data: T): Promise<void>;
    abstract read<T>(collection: string, id: string): Promise<T | null>;
    abstract update<T>(collection: string, id: string, data: Partial<T>): Promise<void>;
    abstract delete(collection: string, id: string): Promise<void>;

    // Query operations
    abstract query<T>(collection: string, options?: QueryOptions): Promise<T[]>;

    // Real-time subscriptions
    abstract subscribe<T>(
        collection: string,
        callback: SubscriptionCallback<T>,
        options?: QueryOptions
    ): UnsubscribeFunction;

    // Batch operations
    abstract batchWrite(operations: BatchOperation[]): Promise<void>;

    // Transaction support (database transactions, not accounting)
    abstract runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T>;
}

// Batch operation types
export type BatchOperation =
    | { type: "create"; collection: string; id: string; data: any }
    | { type: "update"; collection: string; id: string; data: any }
    | { type: "delete"; collection: string; id: string };

// Database configuration
export interface DatabaseConfig {
    type: "firebase" | "mongodb" | "supabase";
    config: any; // Type-specific configuration
}

// Entity-specific adapter methods (for convenience)
export interface EntityAdapter {
    // Books
    getBook(bookId: string): Promise<Book | null>;
    getUserBooks(userId: string): Promise<Book[]>;
    createBook(book: Book): Promise<void>;
    updateBook(bookId: string, data: Partial<Book>): Promise<void>;
    deleteBook(bookId: string): Promise<void>;

    // Accounts (scoped to book)
    getAccount(bookId: string, accountId: string): Promise<Account | null>;
    getBookAccounts(bookId: string): Promise<Account[]>;
    createAccount(bookId: string, account: Account): Promise<void>;
    updateAccount(bookId: string, accountId: string, data: Partial<Account>): Promise<void>;
    deleteAccount(bookId: string, accountId: string): Promise<void>;
    subscribeToAccounts(
        bookId: string,
        callback: SubscriptionCallback<Account>
    ): UnsubscribeFunction;

    // Transactions (scoped to book)
    getTransaction(bookId: string, transactionId: string): Promise<Transaction | null>;
    getBookTransactions(bookId: string, options?: QueryOptions): Promise<Transaction[]>;
    createTransaction(bookId: string, transaction: Transaction): Promise<void>;
    updateTransaction(bookId: string, transactionId: string, data: Partial<Transaction>): Promise<void>;
    deleteTransaction(bookId: string, transactionId: string): Promise<void>;
    subscribeToTransactions(
        bookId: string,
        callback: SubscriptionCallback<Transaction>,
        options?: QueryOptions
    ): UnsubscribeFunction;

    // Splits (scoped to book)
    getTransactionSplits(bookId: string, transactionId: string): Promise<Split[]>;
    createSplits(bookId: string, splits: Split[]): Promise<void>;
    updateSplit(bookId: string, splitId: string, data: Partial<Split>): Promise<void>;
    deleteSplits(bookId: string, transactionId: string): Promise<void>;

    // Categories (scoped to book)
    getBookCategories(bookId: string): Promise<Category[]>;
    createCategory(bookId: string, category: Category): Promise<void>;
    updateCategory(bookId: string, categoryId: string, data: Partial<Category>): Promise<void>;
    deleteCategory(bookId: string, categoryId: string): Promise<void>;

    // Budgets (scoped to book)
    getBookBudgets(bookId: string): Promise<Budget[]>;
    createBudget(bookId: string, budget: Budget): Promise<void>;
    updateBudget(bookId: string, budgetId: string, data: Partial<Budget>): Promise<void>;
    deleteBudget(bookId: string, budgetId: string): Promise<void>;
    subscribeToBudgets(
        bookId: string,
        callback: SubscriptionCallback<Budget>
    ): UnsubscribeFunction;

    // User Preferences (Global)
    getUserPreferences(userId: string): Promise<any>;
    updateUserPreferences(userId: string, data: any): Promise<void>;

    // Recurring Transactions (scoped to book)
    getRecurringTransactions(bookId: string): Promise<RecurringTransaction[]>;
    createRecurringTransaction(bookId: string, transaction: RecurringTransaction): Promise<void>;
    updateRecurringTransaction(bookId: string, transactionId: string, data: Partial<RecurringTransaction>): Promise<void>;
    deleteRecurringTransaction(bookId: string, transactionId: string): Promise<void>;
    subscribeToRecurringTransactions(
        bookId: string,
        callback: SubscriptionCallback<RecurringTransaction>
    ): UnsubscribeFunction;

    // Tags (scoped to book)
    getTags(bookId: string): Promise<Tag[]>;
    createTag(bookId: string, tag: Tag): Promise<void>;
    updateTag(bookId: string, tagId: string, data: Partial<Tag>): Promise<void>;
    deleteTag(bookId: string, tagId: string): Promise<void>;
}
