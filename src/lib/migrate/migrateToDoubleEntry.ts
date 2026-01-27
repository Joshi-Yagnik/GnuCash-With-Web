/**
 * Migration Script: Legacy Transactions → Double-Entry Splits
 * Run this ONCE to convert existing transaction data
 */

import {
    collection,
    getDocs,
    writeBatch,
    doc,
    query,
    where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LegacyTransaction, Transaction, Split } from "@/lib/firebaseTypes";

export async function migrateTransactionsToDoubleEntry(userId: string) {
    console.log("Starting migration for user:", userId);

    try {
        // 1. Get all legacy transactions
        const transactionsRef = collection(db, "transactions");
        const q = query(transactionsRef, where("userId", "==", userId));
        const snapshot = await getDocs(q);

        console.log(`Found ${snapshot.docs.length} transactions to migrate`);

        const batch = writeBatch(db);
        let migratedCount = 0;

        for (const docSnap of snapshot.docs) {
            const legacyTxn = { id: docSnap.id, ...docSnap.data() } as LegacyTransaction;

            // Skip if already migrated (has splits array)
            if ((legacyTxn as any).splits) {
                console.log(`Skipping already migrated transaction: ${legacyTxn.id}`);
                continue;
            }

            // 2. Create splits based on transaction type
            const splits: Split[] = [];
            const transactionId = legacyTxn.id;

            if (legacyTxn.type === "income") {
                // Income: Asset account increases, Income account decreases
                splits.push({
                    id: `${transactionId}-split-1`,
                    transactionId,
                    accountId: legacyTxn.accountId,
                    accountPath: "Assets:Unknown", // Will need manual update
                    accountType: "asset",
                    value: legacyTxn.amount, // Positive = asset increase
                });
                splits.push({
                    id: `${transactionId}-split-2`,
                    transactionId,
                    accountId: "income-placeholder", // Will need manual update
                    accountPath: `Income:${legacyTxn.category || "Other"}`,
                    accountType: "income",
                    value: -legacyTxn.amount, // Negative = income credit
                });
            } else if (legacyTxn.type === "expense") {
                // Expense: Asset account decreases, Expense account increases
                splits.push({
                    id: `${transactionId}-split-1`,
                    transactionId,
                    accountId: legacyTxn.accountId,
                    accountPath: "Assets:Unknown",
                    accountType: "asset",
                    value: -legacyTxn.amount, // Negative = asset decrease
                });
                splits.push({
                    id: `${transactionId}-split-2`,
                    transactionId,
                    accountId: "expense-placeholder",
                    accountPath: `Expenses:${legacyTxn.category || "Other"}`,
                    accountType: "expense",
                    value: legacyTxn.amount, // Positive = expense increase
                });
            } else if (legacyTxn.type === "transfer" && legacyTxn.toAccountId) {
                // Transfer: From account decreases, To account increases
                splits.push({
                    id: `${transactionId}-split-1`,
                    transactionId,
                    accountId: legacyTxn.accountId,
                    accountPath: "Assets:Unknown",
                    accountType: "asset",
                    value: -legacyTxn.amount,
                });
                splits.push({
                    id: `${transactionId}-split-2`,
                    transactionId,
                    accountId: legacyTxn.toAccountId,
                    accountPath: "Assets:Unknown",
                    accountType: "asset",
                    value: legacyTxn.amount,
                });
            } else {
                console.warn(`Skipping unsupported transaction type: ${legacyTxn.type}`);
                continue;
            }

            // 3. Update transaction document with splits
            const newTransaction: Partial<Transaction> = {
                userId: legacyTxn.userId,
                description: legacyTxn.description,
                date: legacyTxn.date,
                notes: legacyTxn.notes,
                splits,
                currency: legacyTxn.currency,
                createdAt: legacyTxn.createdAt,
                updatedAt: new Date(),
            };

            batch.update(doc(db, "transactions", transactionId), newTransaction);
            migratedCount++;
        }

        // 4. Commit all changes
        await batch.commit();

        console.log(`✅ Migration complete! Migrated ${migratedCount} transactions`);
        console.log("⚠️  IMPORTANT: Review migrated transactions and update placeholder accounts");

        return {
            success: true,
            migratedCount,
            total: snapshot.docs.length,
        };
    } catch (error) {
        console.error("❌ Migration failed:", error);
        throw error;
    }
}

// Usage: Call this from browser console or a migration page
// migrateTransactionsToDoubleEntry("your-user-id");
