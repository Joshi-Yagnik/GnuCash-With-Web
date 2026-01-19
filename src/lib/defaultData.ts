import { AccountType } from "./firebaseTypes";

// Default accounts to create for new users
export const DEFAULT_ACCOUNTS = [
    // Asset Accounts
    {
        name: "Cash Wallet",
        type: "asset" as AccountType,
        balance: 0,
        currency: "USD",
        color: "#10b981", // green
        icon: "wallet",
    },
    {
        name: "Bank Account",
        type: "asset" as AccountType,
        balance: 0,
        currency: "USD",
        color: "#3b82f6", // blue
        icon: "building-2",
    },
    {
        name: "Savings Account",
        type: "asset" as AccountType,
        balance: 0,
        currency: "USD",
        color: "#8b5cf6", // purple
        icon: "piggy-bank",
    },
    // Liability Accounts
    {
        name: "Credit Card",
        type: "liability" as AccountType,
        balance: 0,
        currency: "USD",
        color: "#ef4444", // red
        icon: "credit-card",
    },
    {
        name: "Personal Loan",
        type: "liability" as AccountType,
        balance: 0,
        currency: "USD",
        color: "#f97316", // orange
        icon: "file-text",
    },
    // Income Accounts
    {
        name: "Salary Income",
        type: "income" as AccountType,
        balance: 0,
        currency: "USD",
        color: "#22c55e", // light green
        icon: "trending-up",
    },
    {
        name: "Business Income",
        type: "income" as AccountType,
        balance: 0,
        currency: "USD",
        color: "#06b6d4", // cyan
        icon: "briefcase",
    },
    // Expense Accounts
    {
        name: "Living Expenses",
        type: "expense" as AccountType,
        balance: 0,
        currency: "USD",
        color: "#f59e0b", // amber
        icon: "home",
    },
    {
        name: "Entertainment Expenses",
        type: "expense" as AccountType,
        balance: 0,
        currency: "USD",
        color: "#ec4899", // pink
        icon: "film",
    },
];

// Default income categories
export const DEFAULT_INCOME_CATEGORIES = [
    {
        name: "Salary",
        type: "income" as const,
        icon: "briefcase",
        color: "#10b981",
    },
    {
        name: "Business",
        type: "income" as const,
        icon: "store",
        color: "#3b82f6",
    },
    {
        name: "Freelance",
        type: "income" as const,
        icon: "laptop",
        color: "#8b5cf6",
    },
    {
        name: "Other Income",
        type: "income" as const,
        icon: "coins",
        color: "#f59e0b",
    },
];

// Default expense categories
export const DEFAULT_EXPENSE_CATEGORIES = [
    {
        name: "Groceries",
        type: "expense" as const,
        icon: "shopping-cart",
        color: "#ef4444",
    },
    {
        name: "Utilities",
        type: "expense" as const,
        icon: "zap",
        color: "#f59e0b",
    },
    {
        name: "Rent",
        type: "expense" as const,
        icon: "home",
        color: "#8b5cf6",
    },
    {
        name: "Transportation",
        type: "expense" as const,
        icon: "car",
        color: "#3b82f6",
    },
    {
        name: "Entertainment",
        type: "expense" as const,
        icon: "film",
        color: "#ec4899",
    },
    {
        name: "Dining",
        type: "expense" as const,
        icon: "utensils",
        color: "#f97316",
    },
    {
        name: "Healthcare",
        type: "expense" as const,
        icon: "heart-pulse",
        color: "#06b6d4",
    },
];
