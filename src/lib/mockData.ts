import { Wallet, TrendingUp, TrendingDown, ArrowRightLeft, CreditCard, Building2 } from "lucide-react";

export type AccountType = "bank" | "cash" | "credit" | "investment" | "asset" | "liability";
export type TransactionType = "income" | "expense" | "transfer";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  accountId: string;
  toAccountId?: string;
  date: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
}

export const mockAccounts: Account[] = [
  { id: "1", name: "Main Checking", type: "bank", balance: 5420.50, currency: "USD", color: "primary", icon: "building" },
  { id: "2", name: "Savings Account", type: "bank", balance: 12350.00, currency: "USD", color: "accent", icon: "wallet" },
  { id: "3", name: "Cash Wallet", type: "cash", balance: 340.25, currency: "USD", color: "success", icon: "wallet" },
  { id: "4", name: "Credit Card", type: "credit", balance: -1250.00, currency: "USD", color: "destructive", icon: "credit" },
  { id: "5", name: "Investment Portfolio", type: "investment", balance: 25000.00, currency: "USD", color: "chart-3", icon: "trending" },
];

export const mockTransactions: Transaction[] = [
  { id: "1", description: "Salary Deposit", amount: 4500.00, type: "income", category: "Salary", accountId: "1", date: "2024-01-15", notes: "Monthly salary" },
  { id: "2", description: "Grocery Shopping", amount: 156.32, type: "expense", category: "Groceries", accountId: "1", date: "2024-01-14" },
  { id: "3", description: "Netflix Subscription", amount: 15.99, type: "expense", category: "Entertainment", accountId: "4", date: "2024-01-13" },
  { id: "4", description: "Transfer to Savings", amount: 500.00, type: "transfer", category: "Transfer", accountId: "1", toAccountId: "2", date: "2024-01-12" },
  { id: "5", description: "Electric Bill", amount: 89.50, type: "expense", category: "Utilities", accountId: "1", date: "2024-01-11" },
  { id: "6", description: "Freelance Payment", amount: 750.00, type: "income", category: "Freelance", accountId: "1", date: "2024-01-10" },
  { id: "7", description: "Restaurant Dinner", amount: 65.00, type: "expense", category: "Dining", accountId: "3", date: "2024-01-09" },
  { id: "8", description: "Gas Station", amount: 45.00, type: "expense", category: "Transportation", accountId: "4", date: "2024-01-08" },
  { id: "9", description: "Online Purchase", amount: 129.99, type: "expense", category: "Shopping", accountId: "4", date: "2024-01-07" },
  { id: "10", description: "Dividend Income", amount: 125.00, type: "income", category: "Investment", accountId: "5", date: "2024-01-06" },
];

export const mockCategories: Category[] = [
  { id: "1", name: "Salary", type: "income", icon: "briefcase", color: "success" },
  { id: "2", name: "Freelance", type: "income", icon: "laptop", color: "accent" },
  { id: "3", name: "Investment", type: "income", icon: "trending-up", color: "primary" },
  { id: "4", name: "Groceries", type: "expense", icon: "shopping-cart", color: "warning" },
  { id: "5", name: "Entertainment", type: "expense", icon: "film", color: "chart-5" },
  { id: "6", name: "Utilities", type: "expense", icon: "zap", color: "chart-4" },
  { id: "7", name: "Dining", type: "expense", icon: "utensils", color: "expense" },
  { id: "8", name: "Transportation", type: "expense", icon: "car", color: "chart-3" },
  { id: "9", name: "Shopping", type: "expense", icon: "shopping-bag", color: "chart-2" },
];

export const monthlySpendingData = [
  { month: "Jan", income: 5250, expenses: 3200 },
  { month: "Feb", income: 4800, expenses: 2900 },
  { month: "Mar", income: 5100, expenses: 3400 },
  { month: "Apr", income: 5500, expenses: 3100 },
  { month: "May", income: 4900, expenses: 2800 },
  { month: "Jun", income: 5300, expenses: 3500 },
];

export const categorySpendingData = [
  { name: "Groceries", value: 450, color: "hsl(38, 90%, 50%)" },
  { name: "Entertainment", value: 180, color: "hsl(280, 50%, 50%)" },
  { name: "Utilities", value: 220, color: "hsl(38, 90%, 50%)" },
  { name: "Dining", value: 310, color: "hsl(0, 65%, 50%)" },
  { name: "Transportation", value: 280, color: "hsl(210, 70%, 50%)" },
  { name: "Shopping", value: 420, color: "hsl(168, 50%, 40%)" },
];
