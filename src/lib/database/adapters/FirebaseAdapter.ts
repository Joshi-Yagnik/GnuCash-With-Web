/**
 * Firebase/Firestore Database Adapter Implementation
 * Implements the DatabaseAdapter interface for Firebase
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc as firestoreDeleteDoc,
    query,
    where,
    orderBy as firestoreOrderBy,
    limit as firestoreLimit,
    startAfter,
    onSnapshot,
    writeBatch,
    runTransaction as firestoreRunTransaction,
    WhereFilterOp,
    OrderByDirection,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    DatabaseAdapter,
    QueryFilter,
    QueryOptions,
    SubscriptionCallback,
    UnsubscribeFunction,
    BatchOperation,
    EntityAdapter,
} from "../middleware/types";
import { Account, Transaction, Split, Category, Budget, RecurringTransaction, Tag } from "@/lib/firebaseTypes";
import { Book } from "@/lib/bookTypes";

export class FirebaseAdapter extends DatabaseAdapter implements EntityAdapter {
    private connected: boolean = false;

    constructor() {
        super();
        this.connected = !!db;
    }

    isConnected(): boolean {
        return this.connected;
    }

    async connect(): Promise<void> {
        // Firebase initializes automatically
        this.connected = !!db;
        if (!this.connected) {
            throw new Error("Firebase not initialized");
        }
    }

    async disconnect(): Promise<void> {
        // Firebase doesn't require explicit disconnect
        this.connected = false;
    }

    // Generic CRUD operations
    async create<T>(collectionPath: string, id: string, data: T): Promise<void> {
        const docRef = doc(db, collectionPath, id);
        await setDoc(docRef, data);
    }

    async read<T>(collectionPath: string, id: string): Promise<T | null> {
        const docRef = doc(db, collectionPath, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return { ...docSnap.data(), id: docSnap.id } as T;
    }

    async update<T>(collectionPath: string, id: string, data: Partial<T>): Promise<void> {
        const docRef = doc(db, collectionPath, id);
        await updateDoc(docRef, data as any);
    }

    async delete(collectionPath: string, id: string): Promise<void> {
        const docRef = doc(db, collectionPath, id);
        await firestoreDeleteDoc(docRef);
    }

    // Query operations
    async query<T>(collectionPath: string, options?: QueryOptions): Promise<T[]> {
        let q = query(collection(db, collectionPath));

        if (options?.filters) {
            for (const filter of options.filters) {
                q = query(q, where(filter.field, filter.operator as WhereFilterOp, filter.value));
            }
        }

        if (options?.orderBy) {
            for (const order of options.orderBy) {
                q = query(q, firestoreOrderBy(order.field, order.direction as OrderByDirection));
            }
        }

        if (options?.limit) {
            q = query(q, firestoreLimit(options.limit));
        }

        if (options?.startAfter) {
            q = query(q, startAfter(options.startAfter));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as T));
    }

    // Real-time subscriptions
    subscribe<T>(
        collectionPath: string,
        callback: SubscriptionCallback<T>,
        options?: QueryOptions
    ): UnsubscribeFunction {
        let q = query(collection(db, collectionPath));

        if (options?.filters) {
            for (const filter of options.filters) {
                q = query(q, where(filter.field, filter.operator as WhereFilterOp, filter.value));
            }
        }

        if (options?.orderBy) {
            for (const order of options.orderBy) {
                q = query(q, firestoreOrderBy(order.field, order.direction as OrderByDirection));
            }
        }

        if (options?.limit) {
            q = query(q, firestoreLimit(options.limit));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as T));
            callback(data);
        });

        return unsubscribe;
    }

    // Batch operations
    async batchWrite(operations: BatchOperation[]): Promise<void> {
        const batch = writeBatch(db);

        for (const op of operations) {
            const docRef = doc(db, op.collection, op.id);

            if (op.type === "create") {
                batch.set(docRef, op.data);
            } else if (op.type === "update") {
                batch.update(docRef, op.data);
            } else if (op.type === "delete") {
                batch.delete(docRef);
            }
        }

        await batch.commit();
    }

    // Transaction support
    async runTransaction<T>(updateFunction: (transaction: any) => Promise<T>): Promise<T> {
        return await firestoreRunTransaction(db, updateFunction);
    }

    // ==================== Entity-Specific Methods ====================

    // Books
    async getBook(bookId: string): Promise<Book | null> {
        return this.read<Book>("books", bookId);
    }

    async getUserBooks(userId: string): Promise<Book[]> {
        try {
            return await this.query<Book>("books", {
                filters: [{ field: "userId", operator: "==", value: userId }],
                orderBy: [{ field: "createdAt", direction: "desc" }],
            });
        } catch (error: any) {
            console.warn("Ordered book query failed, likely missing index. Falling back to unordered query.", error);
            // Fallback: Query without ordering and sort in memory if needed (or just return unordered)
            const books = await this.query<Book>("books", {
                filters: [{ field: "userId", operator: "==", value: userId }],
            });
            // Sort in memory to maintain expected behavior
            return books.sort((a, b) => {
                const dateA = a.createdAt instanceof Object ? (a.createdAt as any).toMillis?.() || 0 : new Date(a.createdAt).getTime();
                const dateB = b.createdAt instanceof Object ? (b.createdAt as any).toMillis?.() || 0 : new Date(b.createdAt).getTime();
                return dateB - dateA;
            });
        }
    }

    async createBook(book: Book): Promise<void> {
        return this.create("books", book.id, book);
    }

    async updateBook(bookId: string, data: Partial<Book>): Promise<void> {
        return this.update("books", bookId, data);
    }

    async deleteBook(bookId: string): Promise<void> {
        return this.delete("books", bookId);
    }

    // Accounts (scoped to book)
    async getAccount(bookId: string, accountId: string): Promise<Account | null> {
        return this.read<Account>(`books/${bookId}/accounts`, accountId);
    }

    async getBookAccounts(bookId: string): Promise<Account[]> {
        return this.query<Account>(`books/${bookId}/accounts`, {
            orderBy: [{ field: "createdAt", direction: "asc" }],
        });
    }

    async createAccount(bookId: string, account: Account): Promise<void> {
        return this.create(`books/${bookId}/accounts`, account.id, account);
    }

    async updateAccount(bookId: string, accountId: string, data: Partial<Account>): Promise<void> {
        return this.update(`books/${bookId}/accounts`, accountId, data);
    }

    async deleteAccount(bookId: string, accountId: string): Promise<void> {
        return this.delete(`books/${bookId}/accounts`, accountId);
    }

    subscribeToAccounts(
        bookId: string,
        callback: SubscriptionCallback<Account>
    ): UnsubscribeFunction {
        return this.subscribe(`books/${bookId}/accounts`, callback, {
            orderBy: [{ field: "createdAt", direction: "asc" }],
        });
    }

    // Transactions (scoped to book)
    async getTransaction(bookId: string, transactionId: string): Promise<Transaction | null> {
        return this.read<Transaction>(`books/${bookId}/transactions`, transactionId);
    }

    async getBookTransactions(bookId: string, options?: QueryOptions): Promise<Transaction[]> {
        return this.query<Transaction>(`books/${bookId}/transactions`, {
            ...options,
            orderBy: options?.orderBy || [{ field: "date", direction: "desc" }],
        });
    }

    async createTransaction(bookId: string, transaction: Transaction): Promise<void> {
        return this.create(`books/${bookId}/transactions`, transaction.id, transaction);
    }

    async updateTransaction(
        bookId: string,
        transactionId: string,
        data: Partial<Transaction>
    ): Promise<void> {
        return this.update(`books/${bookId}/transactions`, transactionId, data);
    }

    async deleteTransaction(bookId: string, transactionId: string): Promise<void> {
        return this.delete(`books/${bookId}/transactions`, transactionId);
    }

    subscribeToTransactions(
        bookId: string,
        callback: SubscriptionCallback<Transaction>,
        options?: QueryOptions
    ): UnsubscribeFunction {
        return this.subscribe(`books/${bookId}/transactions`, callback, {
            ...options,
            orderBy: options?.orderBy || [{ field: "date", direction: "desc" }],
        });
    }

    // Splits (scoped to book)
    async getTransactionSplits(bookId: string, transactionId: string): Promise<Split[]> {
        return this.query<Split>(`books/${bookId}/splits`, {
            filters: [{ field: "transactionId", operator: "==", value: transactionId }],
        });
    }

    async createSplits(bookId: string, splits: Split[]): Promise<void> {
        const operations: BatchOperation[] = splits.map((split) => ({
            type: "create",
            collection: `books/${bookId}/splits`,
            id: split.id,
            data: split,
        }));
        return this.batchWrite(operations);
    }

    async updateSplit(bookId: string, splitId: string, data: Partial<Split>): Promise<void> {
        return this.update(`books/${bookId}/splits`, splitId, data);
    }

    async deleteSplits(bookId: string, transactionId: string): Promise<void> {
        const splits = await this.getTransactionSplits(bookId, transactionId);
        const operations: BatchOperation[] = splits.map((split) => ({
            type: "delete",
            collection: `books/${bookId}/splits`,
            id: split.id,
        }));
        return this.batchWrite(operations);
    }

    // Categories (scoped to book)
    async getBookCategories(bookId: string): Promise<Category[]> {
        return this.query<Category>(`books/${bookId}/categories`);
    }

    async createCategory(bookId: string, category: Category): Promise<void> {
        return this.create(`books/${bookId}/categories`, category.id, category);
    }

    async updateCategory(bookId: string, categoryId: string, data: Partial<Category>): Promise<void> {
        return this.update(`books/${bookId}/categories`, categoryId, data);
    }

    async deleteCategory(bookId: string, categoryId: string): Promise<void> {
        return this.delete(`books/${bookId}/categories`, categoryId);
    }

    // Budgets (scoped to book)
    async getBookBudgets(bookId: string): Promise<Budget[]> {
        return this.query<Budget>(`books/${bookId}/budgets`);
    }

    async createBudget(bookId: string, budget: Budget): Promise<void> {
        return this.create(`books/${bookId}/budgets`, budget.id, budget);
    }

    async updateBudget(bookId: string, budgetId: string, data: Partial<Budget>): Promise<void> {
        return this.update(`books/${bookId}/budgets`, budgetId, data);
    }

    async deleteBudget(bookId: string, budgetId: string): Promise<void> {
        return this.delete(`books/${bookId}/budgets`, budgetId);
    }

    subscribeToBudgets(
        bookId: string,
        callback: SubscriptionCallback<Budget>
    ): UnsubscribeFunction {
        return this.subscribe(`books/${bookId}/budgets`, callback);
    }

    // Recurring Transactions (scoped to book)
    async getRecurringTransactions(bookId: string): Promise<RecurringTransaction[]> {
        return this.query<RecurringTransaction>(`books/${bookId}/recurring_transactions`);
    }

    async createRecurringTransaction(bookId: string, transaction: RecurringTransaction): Promise<void> {
        return this.create(`books/${bookId}/recurring_transactions`, transaction.id, transaction);
    }

    async updateRecurringTransaction(
        bookId: string,
        transactionId: string,
        data: Partial<RecurringTransaction>
    ): Promise<void> {
        return this.update(`books/${bookId}/recurring_transactions`, transactionId, data);
    }

    async deleteRecurringTransaction(bookId: string, transactionId: string): Promise<void> {
        return this.delete(`books/${bookId}/recurring_transactions`, transactionId);
    }

    subscribeToRecurringTransactions(
        bookId: string,
        callback: SubscriptionCallback<RecurringTransaction>
    ): UnsubscribeFunction {
        return this.subscribe(`books/${bookId}/recurring_transactions`, callback);
    }



    // Tags (scoped to book)
    async getTags(bookId: string): Promise<Tag[]> {
        return this.query<Tag>(`books/${bookId}/tags`);
    }

    async createTag(bookId: string, tag: Tag): Promise<void> {
        return this.create(`books/${bookId}/tags`, tag.id, tag);
    }

    async updateTag(bookId: string, tagId: string, data: Partial<Tag>): Promise<void> {
        return this.update(`books/${bookId}/tags`, tagId, data);
    }

    async deleteTag(bookId: string, tagId: string): Promise<void> {
        return this.delete(`books/${bookId}/tags`, tagId);
    }

    // User Preferences
    async getUserPreferences(userId: string): Promise<any> {
        return this.read("userPreferences", userId);
    }

    async updateUserPreferences(userId: string, data: any): Promise<void> {
        // Use set with merge true logic (handled by update usually, but for prefs we might want upsert)
        // Since `create` uses setDoc (which overwrites or creates), and `update` uses updateDoc (fails if not exists).
        // For preferences, it's safer to use setDoc with merge: true if we could, but our adapter abstracts it.
        // Let's try update, if fails catch and create? Or just use create (setDoc) which is an upsert in Firestore usually?
        // Actually, my `create` implementation uses `setDoc` which IS an upsert/overwrite.
        // `update` uses `updateDoc` which requires existence.
        // So for "updateUserPreferences", we should probably use `setDoc` with merge if possible, or just `create` if we treat ID as constant.

        // However, to strictly follow the adapter pattern:
        // We'll try to update. If it fails (document doesn't exist), we create it.
        try {
            await this.update("userPreferences", userId, data);
        } catch (e: any) {
            if (e.code === 'not-found') {
                // Initialize with default preferences merged with data if needed, or just data
                await this.create("userPreferences", userId, data);
            } else {
                throw e;
            }
        }
    }
}
