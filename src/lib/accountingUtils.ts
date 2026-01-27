/**
 * Double-Entry Accounting Logic Utilities
 * Based on GnuCash accounting principles
 */

import { AccountType, Split, Transaction } from "./firebaseTypes";

/**
 * Accounting Equation Rules:
 * 
 * ASSETS = LIABILITIES + EQUITY
 * 
 * Account Type | Debit (+) | Credit (-)
 * -------------|-----------|------------
 * Asset        | Increase  | Decrease
 * Liability    | Decrease  | Increase  
 * Income       | Decrease  | Increase
 * Expense      | Increase  | Decrease
 * 
 * In GnuCash:
 * - Positive value in an Asset/Expense = Debit (increase)
 * - Positive value in Liability/Income = Credit (increase)
 * - All splits in a transaction must sum to 0
 */

/**
 * Calculate how a value affects an account balance
 * @param accountType The type of account
 * @param value The split value (positive or negative)
 * @returns The amount to add to the account balance
 */
export function calculateBalanceChange(
    accountType: AccountType,
    value: number
): number {
    // For Assets and Expenses: positive value = increase balance
    // For Liabilities and Income: positive value = decrease balance

    if (accountType === "asset" || accountType === "expense") {
        return value;
    } else {
        // liability or income
        return -value;
    }
}

/**
 * Validate that splits balance (sum to zero)
 * @param splits Array of splits
 * @returns true if balanced, false otherwise
 */
export function validateSplitsBalance(splits: Split[]): boolean {
    const sum = splits.reduce((total, split) => total + split.value, 0);
    // Allow small floating point errors
    return Math.abs(sum) < 0.01;
}

/**
 * Create splits for a simple two-account transaction
 * This is the most common case (e.g., pay cash for food)
 * 
 * @param fromAccount Account to deduct from
 * @param toAccount Account to add to
 * @param amount Amount to transfer
 * @param transactionId ID of the parent transaction
 * @returns Array of 2 splits
 */
export function createSimpleSplits(
    transactionId: string,
    fromAccount: { id: string; path: string; type: AccountType },
    toAccount: { id: string; path: string; type: AccountType },
    amount: number
): Split[] {
    // Example: Pay ₹100 cash for food
    // Cash (Asset) decreases by 100 → Split 1: -100
    // Food (Expense) increases by 100 → Split 2: +100

    const splits: Split[] = [
        {
            id: `${transactionId}-split-1`,
            transactionId,
            accountId: fromAccount.id,
            accountPath: fromAccount.path,
            accountType: fromAccount.type,
            value: -Math.abs(amount), // Always negative (decrease)
            memo: "",
        },
        {
            id: `${transactionId}-split-2`,
            transactionId,
            accountId: toAccount.id,
            accountPath: toAccount.path,
            accountType: toAccount.type,
            value: Math.abs(amount), // Always positive (increase)
            memo: "",
        },
    ];

    return splits;
}

/**
 * Determine transaction display type from splits
 * This helps with UI display and legacy code compatibility
 * 
 * @param splits Array of splits
 * @param viewedAccountId The account being viewed (for perspective)
 * @returns "income", "expense", or "transfer"
 */
export function inferTransactionType(
    splits: Split[],
    viewedAccountId?: string
): "income" | "expense" | "transfer" {
    if (!viewedAccountId) {
        // General inference
        const hasIncome = splits.some((s) => s.accountType === "income");
        const hasExpense = splits.some((s) => s.accountType === "expense");

        if (hasIncome) return "income";
        if (hasExpense) return "expense";
        return "transfer";
    }

    // From perspective of viewed account
    const viewedSplit = splits.find((s) => s.accountId === viewedAccountId);
    if (!viewedSplit) return "transfer";

    const otherSplits = splits.filter((s) => s.accountId !== viewedAccountId);
    if (otherSplits.some((s) => s.accountType === "income")) return "income";
    if (otherSplits.some((s) => s.accountType === "expense")) return "expense";

    return "transfer";
}

/**
 * Get the display amount for a transaction from an account's perspective
 * Positive = money coming in (green)
 * Negative = money going out (red)
 * 
 * @param splits Transaction splits
 * @param accountId The account being viewed
 * @returns Amount to display (with sign for color coding)
 */
export function getDisplayAmount(splits: Split[], accountId: string): number {
    const accountSplit = splits.find((s) => s.accountId === accountId);
    if (!accountSplit) return 0;

    // The split value already represents the change to this account
    // Positive = increase, Negative = decrease
    return calculateBalanceChange(accountSplit.accountType, accountSplit.value);
}

/**
 * Get the "other" account path for simple 2-split transactions
 * Used for display (e.g., "Paid to: Food:Restaurant")
 * 
 * @param splits Transaction splits
 * @param currentAccountId The account being viewed
 * @returns The path of the other account, or "Multiple Accounts" if split
 */
export function getOtherAccountPath(
    splits: Split[],
    currentAccountId: string
): string {
    const otherSplits = splits.filter((s) => s.accountId !== currentAccountId);

    if (otherSplits.length === 0) return "Unknown";
    if (otherSplits.length === 1) return otherSplits[0].accountPath;

    return "Multiple Accounts";
}

/**
 * Helper to create a simple income transaction
 * Example: Receive salary
 * 
 * @param bankAccount Bank account receiving money
 * @param incomeAccount Income account (e.g., Salary)
 * @param amount Amount received
 */
export function createIncomeTransaction(
    transactionId: string,
    bankAccount: { id: string; path: string; type: AccountType },
    incomeAccount: { id: string; path: string; type: AccountType },
    amount: number
): Split[] {
    return [
        {
            id: `${transactionId}-split-1`,
            transactionId,
            accountId: bankAccount.id,
            accountPath: bankAccount.path,
            accountType: bankAccount.type,
            value: amount, // Bank increases
            memo: "",
        },
        {
            id: `${transactionId}-split-2`,
            transactionId,
            accountId: incomeAccount.id,
            accountPath: incomeAccount.path,
            accountType: incomeAccount.type,
            value: -amount, // Income "decreases" (negative credit)
            memo: "",
        },
    ];
}

/**
 * Helper to create a simple expense transaction
 * Example: Pay for groceries
 */
export function createExpenseTransaction(
    transactionId: string,
    paymentAccount: { id: string; path: string; type: AccountType },
    expenseAccount: { id: string; path: string; type: AccountType },
    amount: number
): Split[] {
    return [
        {
            id: `${transactionId}-split-1`,
            transactionId,
            accountId: paymentAccount.id,
            accountPath: paymentAccount.path,
            accountType: paymentAccount.type,
            value: -amount, // Payment account decreases
            memo: "",
        },
        {
            id: `${transactionId}-split-2`,
            transactionId,
            accountId: expenseAccount.id,
            accountPath: expenseAccount.path,
            accountType: expenseAccount.type,
            value: amount, // Expense increases
            memo: "",
        },
    ];
}
