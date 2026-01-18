export type AccountType = "asset" | "liability" | "income" | "expense";
export type TransactionType = "income" | "expense" | "transfer";
export type SplitType = "debit" | "credit";

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
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
