/**
 * Database Service - Singleton
 * Central access point for all database operations
 * Automatically uses the configured adapter (Firebase, MongoDB, etc.)
 */

import { FirebaseAdapter } from "./adapters/FirebaseAdapter";
import { EntityAdapter } from "./middleware/types";

class DatabaseService implements EntityAdapter {
    private static instance: DatabaseService;
    private adapter: EntityAdapter;

    private constructor() {
        // Initialize with Firebase adapter by default
        // In the future, this can be configured via environment variables
        this.adapter = new FirebaseAdapter();
    }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    // Delegate all methods to  the adapter
    async getBook(bookId: string) {
        return this.adapter.getBook(bookId);
    }

    async getUserBooks(userId: string) {
        return this.adapter.getUserBooks(userId);
    }

    async createBook(book: any) {
        return this.adapter.createBook(book);
    }

    async updateBook(bookId: string, data: any) {
        return this.adapter.updateBook(bookId, data);
    }

    async deleteBook(bookId: string) {
        return this.adapter.deleteBook(bookId);
    }

    async getAccount(bookId: string, accountId: string) {
        return this.adapter.getAccount(bookId, accountId);
    }

    async getBookAccounts(bookId: string) {
        return this.adapter.getBookAccounts(bookId);
    }

    async createAccount(bookId: string, account: any) {
        return this.adapter.createAccount(bookId, account);
    }

    async updateAccount(bookId: string, accountId: string, data: any) {
        return this.adapter.updateAccount(bookId, accountId, data);
    }

    async deleteAccount(bookId: string, accountId: string) {
        return this.adapter.deleteAccount(bookId, accountId);
    }

    subscribeToAccounts(bookId: string, callback: any) {
        return this.adapter.subscribeToAccounts(bookId, callback);
    }

    async getTransaction(bookId: string, transactionId: string) {
        return this.adapter.getTransaction(bookId, transactionId);
    }

    async getBookTransactions(bookId: string, options?: any) {
        return this.adapter.getBookTransactions(bookId, options);
    }

    async createTransaction(bookId: string, transaction: any) {
        return this.adapter.createTransaction(bookId, transaction);
    }

    async updateTransaction(bookId: string, transactionId: string, data: any) {
        return this.adapter.updateTransaction(bookId, transactionId, data);
    }

    async deleteTransaction(bookId: string, transactionId: string) {
        return this.adapter.deleteTransaction(bookId, transactionId);
    }

    subscribeToTransactions(bookId: string, callback: any, options?: any) {
        return this.adapter.subscribeToTransactions(bookId, callback, options);
    }

    async getTransactionSplits(bookId: string, transactionId: string) {
        return this.adapter.getTransactionSplits(bookId, transactionId);
    }

    async createSplits(bookId: string, splits: any[]) {
        return this.adapter.createSplits(bookId, splits);
    }

    async updateSplit(bookId: string, splitId: string, data: any) {
        return this.adapter.updateSplit(bookId, splitId, data);
    }

    async deleteSplits(bookId: string, transactionId: string) {
        return this.adapter.deleteSplits(bookId, transactionId);
    }

    async getBookCategories(bookId: string) {
        return this.adapter.getBookCategories(bookId);
    }

    async createCategory(bookId: string, category: any) {
        return this.adapter.createCategory(bookId, category);
    }

    async updateCategory(bookId: string, categoryId: string, data: any) {
        return this.adapter.updateCategory(bookId, categoryId, data);
    }

    async deleteCategory(bookId: string, categoryId: string) {
        return this.adapter.deleteCategory(bookId, categoryId);
    }

    // Budgets (scoped to book)
    async getBookBudgets(bookId: string) {
        return this.adapter.getBookBudgets(bookId);
    }

    async createBudget(bookId: string, budget: any) {
        return this.adapter.createBudget(bookId, budget);
    }

    async updateBudget(bookId: string, budgetId: string, data: any) {
        return this.adapter.updateBudget(bookId, budgetId, data);
    }

    async deleteBudget(bookId: string, budgetId: string) {
        return this.adapter.deleteBudget(bookId, budgetId);
    }

    subscribeToBudgets(bookId: string, callback: any) {
        return this.adapter.subscribeToBudgets(bookId, callback);
    }

    // Recurring Transactions
    async getRecurringTransactions(bookId: string) {
        return this.adapter.getRecurringTransactions(bookId);
    }

    async createRecurringTransaction(bookId: string, transaction: any) {
        return this.adapter.createRecurringTransaction(bookId, transaction);
    }

    async updateRecurringTransaction(bookId: string, transactionId: string, data: any) {
        return this.adapter.updateRecurringTransaction(bookId, transactionId, data);
    }

    async deleteRecurringTransaction(bookId: string, transactionId: string) {
        return this.adapter.deleteRecurringTransaction(bookId, transactionId);
    }

    subscribeToRecurringTransactions(bookId: string, callback: any) {
        return this.adapter.subscribeToRecurringTransactions(bookId, callback);
    }



    // Tags
    async getTags(bookId: string) {
        return this.adapter.getTags(bookId);
    }

    async createTag(bookId: string, tag: any) {
        return this.adapter.createTag(bookId, tag);
    }

    async updateTag(bookId: string, tagId: string, data: any) {
        return this.adapter.updateTag(bookId, tagId, data);
    }

    async deleteTag(bookId: string, tagId: string) {
        return this.adapter.deleteTag(bookId, tagId);
    }

    // User Preferences
    async getUserPreferences(userId: string) {
        return this.adapter.getUserPreferences(userId);
    }

    async updateUserPreferences(userId: string, data: any) {
        return this.adapter.updateUserPreferences(userId, data);
    }
}

// Export singleton instance
export const db = DatabaseService.getInstance();
export default db;
