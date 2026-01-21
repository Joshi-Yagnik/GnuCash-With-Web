export type AccountType = "asset" | "liability" | "income" | "expense";
export type TransactionType = "income" | "expense" | "transfer";
export type SplitType = "debit" | "credit";
export type Currency = "INR" | "USD" | "EUR" | "GBP" | "JPY" | "AUD" | "CAD" | "CHF" | "CNY";
export type ActivityType = "account_update" | "balance_update" | "currency_update";

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: Currency;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Split {
  id: string;
  transactionId: string;
  accountId: string;
  accountName: string; // Denormalized for easier display
  amount: number;
  memo?: string;
  type: SplitType; // debit or credit
}

export interface Transaction {
  id: string;
  userId: string;
  description: string;
  amount: number;
  currency: Currency; // Currency of the transaction
  type: TransactionType;
  category: string;
  accountId: string;
  toAccountId?: string; // Deprecated in favor of splits
  date: Date;
  notes?: string;
  isSplit: boolean; // Flag to indicate split transaction
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
