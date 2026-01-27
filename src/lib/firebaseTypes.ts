export type AccountType = "asset" | "liability" | "income" | "expense";
export type TransactionType = "income" | "expense" | "transfer";
export type SplitType = "debit" | "credit";
export type Currency = "INR" | "USD" | "EUR" | "GBP" | "JPY" | "AUD" | "CAD" | "CHF" | "CNY";
export type ActivityType = "account_update" | "balance_update" | "currency_update";

// Account hierarchy path (e.g., "Assets:Current Assets:Savings Account:SBI")
export type AccountPath = string;

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: Currency;
  color: string;
  icon: string;
  parentId?: string; // For account hierarchy
  path?: string; // Full path for display (e.g., "Assets:Bank:Checking")
  createdAt: Date;
  updatedAt: Date;
  isCategory?: boolean; // Flag for categories treated as accounts (GnuCash style)
}

/**
 * Split - Double-Entry Accounting Entry
 * In GnuCash/double-entry accounting:
 * - Every transaction has 2+ splits
 * - Each split affects one account
 * - Positive value = increase, Negative = decrease
 * - Sum of all splits in a transaction = 0 (balanced)
 * 
 * Examples:
 * Income: Bank +5000, Salary -5000
 * Expense: Cash -100, Food Expense +100
 * Transfer: Bank A -500, Bank B +500
 */
export interface Split {
  id: string;
  transactionId: string;
  accountId: string;
  accountPath: string; // Denormalized for display (e.g., "Assets:Bank:SBI")
  accountType: AccountType; // Denormalized for logic
  value: number; // Positive or negative - determines debit/credit based on account type
  memo?: string;
  reconciledState?: "n" | "c" | "y"; // Not reconciled, Cleared, Reconciled
}

/**
 * Transaction - GnuCash Style
 * A transaction is a balanced set of splits
 * No "type" field - type is inferred from involved accounts
 */
export interface Transaction {
  id: string;
  userId: string;
  description: string;
  date: Date;
  number?: string; // Check/receipt number (from screenshot)
  notes?: string;
  splits: Split[]; // Must have at least 2 splits
  currency?: Currency; // Primary currency (from main account)
  isRecurring?: boolean;
  scheduleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy transaction for migration
export interface LegacyTransaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  currency: Currency;
  type: "income" | "expense" | "transfer";
  category: string;
  accountId: string;
  toAccountId?: string;
  date: Date;
  notes?: string;
  isSplit: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
}

export interface AccountActivity {
  id: string;
  userId: string;
  accountId: string;
  accountName: string;
  type: ActivityType;
  changes: {
    balance?: { old: number; new: number };
    currency?: { old: Currency; new: Currency };
    name?: { old: string; new: string };
  };
  date: Date;
  createdAt: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  defaultCurrency: Currency;
  preferredCurrencies: Currency[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExchangeRate {
  id: string;
  baseCurrency: Currency;
  targetCurrency: Currency;
  rate: number;
  lastUpdated: Date;
}

// Helper type for transaction display (matches screenshot)
export interface TransactionDisplay {
  id: string;
  description: string;
  accountPath: string;
  date: Date;
  amount: number; // For display - from perspective of the viewed account
  isPositive: boolean; // Green or red
}

export interface Budget {
  id: string;
  userId: string;
  bookId: string;
  categoryId: string; // Link to an expense category
  amount: number; // Monthly limit
  period: "monthly"; // For now, stick to monthly
  periodstart?: Date; // Start date of the budget period
  createdAt: Date;
  updatedAt: Date;
}

export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly" | "custom";
export type RecurringInterval = number; // e.g., 2 for "every 2 weeks"

export interface RecurringTransaction {
  id: string;
  userId: string;
  bookId: string;
  frequency: RecurringFrequency;
  interval: RecurringInterval;
  startDate: Date;
  endDate?: Date;
  lastRun?: Date;
  nextRun: Date;
  active: boolean;
  template: {
    description: string;
    amount: number;
    type: TransactionType; // inferred
    splits: Omit<Split, "id" | "transactionId">[];
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  userId: string;
  bookId: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}
