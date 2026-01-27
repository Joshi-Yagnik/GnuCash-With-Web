/**
 * Firestore Data Hook - Double-Entry Accounting with Multi-Book Support
 * Completely rewritten for GnuCash-style splits and book scoping
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBook } from "@/contexts/BookContext";
import { Account, Transaction, Split, Category, AccountActivity, SplitType, AccountType } from "@/lib/firebaseTypes";
import db from "@/lib/database/DatabaseService";
import {
  validateSplitsBalance,
  calculateBalanceChange,
  getDisplayAmount,
  inferTransactionType,
  createSimpleSplits,
} from "@/lib/accountingUtils";
import { convertToINR, FALLBACK_EXCHANGE_RATES } from "@/lib/currencyUtils";
import { toast } from "sonner";

export function useFirestoreData() {
  const { user } = useAuth();
  const { currentBook } = useBook();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to accounts for current book
  useEffect(() => {
    if (!user || !currentBook) {
      setAccounts([]);
      setTransactions([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to accounts for current book
    const unsubAccounts = db.subscribeToAccounts(currentBook.id, (accountsData) => {
      setAccounts(accountsData);
    });

    // Subscribe to transactions  
    const unsubTransactions = db.subscribeToTransactions(currentBook.id, (transactionsData) => {
      console.log("Transactions loaded:", transactionsData.length);
      setTransactions(transactionsData);
      setLoading(false);
    });

    // Subscribe to categories and update state
    db.getBookCategories(currentBook.id).then((categoriesData) => {
      setCategories(categoriesData);
    });

    return () => {
      unsubAccounts();
      unsubTransactions();
    };
  }, [user, currentBook]);

  // Combine Accounts and Categories for Unified "All Accounts" View (GnuCash Style)
  const allAccounts: Account[] = [
    ...accounts,
    ...categories.map(cat => ({
      id: cat.id,
      userId: cat.userId,
      name: cat.name,
      type: cat.type as "income" | "expense", // Map category type to account type
      balance: 0, // Categories don't hold balance (conceptually infinite/zero in this context)
      currency: accounts[0]?.currency || "INR", // Default currency
      color: cat.color,
      icon: cat.icon,
      isCategory: true, // Flag to distinguish
      createdAt: new Date(), // Dummy
      updatedAt: new Date(), // Dummy
    } as Account))
  ];

  // ==================== CALCULATED TOTALS ====================

  const getTotalBalance = useCallback(() => {
    return accounts
      .filter((a) => a.type === "asset" || a.type === "liability")
      .reduce((sum, account) => {
        const balanceInINR = convertToINR(
          account.balance,
          account.currency || "INR",
          FALLBACK_EXCHANGE_RATES
        );

        if (account.type === "liability") {
          return sum - balanceInINR;
        }
        return sum + balanceInINR;
      }, 0);
  }, [accounts]);

  const getTotalIncome = useCallback(() => {
    // In double-entry, income is determined by splits involving income accounts
    let total = 0;

    transactions.forEach((transaction) => {
      const incomeSplits = transaction.splits.filter((s) => s.accountType === "income");
      incomeSplits.forEach((split) => {
        // Income accounts increase with credits (negative values in our system)
        // So we negate to get the positive income amount
        total += Math.abs(split.value);
      });
    });

    return total;
  }, [transactions]);

  const getTotalExpenses = useCallback(() => {
    // In double-entry, expenses are determined by splits involving expense accounts
    let total = 0;

    transactions.forEach((transaction) => {
      const expenseSplits = transaction.splits.filter((s) => s.accountType === "expense");
      expenseSplits.forEach((split) => {
        // Expense accounts increase with debits (positive values)
        total += Math.abs(split.value);
      });
    });

    return total;
  }, [transactions]);

  // ==================== ACCOUNT OPERATIONS ====================

  const getAccountById = useCallback(
    (id: string) => accounts.find((a) => a.id === id),
    [accounts]
  );

  const addAccount = useCallback(
    async (account: Omit<Account, "id" | "userId" | "createdAt" | "updatedAt">) => {
      if (!user || !currentBook) {
        toast.error("Please log in and select a book");
        return;
      }

      const newAccount: Account = {
        id: `acc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: user.uid,
        ...account,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        await db.createAccount(currentBook.id, newAccount);
        toast.success("Account created successfully");
      } catch (error) {
        console.error("Error creating account:", error);
        toast.error("Failed to create account");
        throw error;
      }
    },
    [user, currentBook]
  );

  const updateAccount = useCallback(
    async (id: string, updates: Partial<Account>) => {
      if (!user || !currentBook) return;

      try {
        await db.updateAccount(currentBook.id, id, {
          ...updates,
          updatedAt: new Date(),
        });
        toast.success("Account updated");
      } catch (error) {
        console.error("Error updating account:", error);
        toast.error("Failed to update account");
        throw error;
      }
    },
    [user, currentBook]
  );

  const deleteAccount = useCallback(
    async (id: string) => {
      if (!currentBook) return;

      // Check for related transactions
      const relatedTransactions = transactions.filter((t) =>
        t.splits.some((s) => s.accountId === id)
      );

      if (relatedTransactions.length > 0) {
        toast.error(
          `Cannot delete account with ${relatedTransactions.length} transactions. Delete transactions first.`
        );
        return;
      }

      try {
        await db.deleteAccount(currentBook.id, id);
        toast.success("Account deleted");
      } catch (error) {
        console.error("Error deleting account:", error);
        toast.error("Failed to delete account");
        throw error;
      }
    },
    [currentBook, transactions]
  );

  // ==================== TRANSACTION OPERATIONS ====================

  /**
   * Add a simple two-account transaction
   * This creates the proper splits automatically
   */
  const addTransaction = useCallback(
    async (params: {
      description: string;
      amount: number;
      fromAccountId: string;
      toAccountId: string;
      date: Date;
      number?: string;
      notes?: string;
    }) => {
      if (!user || !currentBook) {
        toast.error("Please log in and select a book");
        return;
      }

      const { description, amount, fromAccountId, toAccountId, date, number, notes } = params;

      // Get account details for split creation
      // Check both accounts (assets/liabilities) and categories (income/expenses)
      let fromAccount = accounts.find((a) => a.id === fromAccountId);
      if (!fromAccount) {
        const cat = categories.find(c => c.id === fromAccountId);
        if (cat) {
          fromAccount = {
            id: cat.id,
            userId: cat.userId,
            name: cat.name,
            type: cat.type as AccountType,
            balance: 0,
            currency: accounts[0]?.currency || "INR",
            color: cat.color,
            icon: cat.icon,
            createdAt: new Date(),
            updatedAt: new Date(),
            path: cat.name // Use name as path for categories
          } as Account;
        }
      }

      let toAccount = accounts.find((a) => a.id === toAccountId);
      if (!toAccount) {
        const cat = categories.find(c => c.id === toAccountId);
        if (cat) {
          toAccount = {
            id: cat.id,
            userId: cat.userId,
            name: cat.name,
            type: cat.type as AccountType,
            balance: 0,
            currency: accounts[0]?.currency || "INR",
            color: cat.color,
            icon: cat.icon,
            createdAt: new Date(),
            updatedAt: new Date(),
            path: cat.name // Use name as path for categories
          } as Account;
        }
      }

      if (!fromAccount || !toAccount) {
        toast.error("Invalid accounts/categories selected");
        return;
      }

      // Create transaction ID
      const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create splits (from account decreases, to account increases)
      const splits = createSimpleSplits(
        transactionId,
        {
          id: fromAccount.id,
          path: fromAccount.path || fromAccount.name,
          type: fromAccount.type,
        },
        {
          id: toAccount.id,
          path: toAccount.path || toAccount.name,
          type: toAccount.type,
        },
        amount
      );

      // Validate splits balance
      if (!validateSplitsBalance(splits)) {
        toast.error("Transaction splits don't balance");
        return;
      }

      // Create transaction
      const newTransaction: Transaction = {
        id: transactionId,
        userId: user.uid,
        description,
        date,
        number,
        notes,
        splits,
        currency: fromAccount.currency,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        // Save transaction
        await db.createTransaction(currentBook.id, newTransaction);

        // Update account balances (ONLY for Asset/Liability accounts)
        // Income/Expense categories don't store balance in the accounts collection
        if (fromAccount.type === 'asset' || fromAccount.type === 'liability') {
          const fromBalanceChange = calculateBalanceChange(fromAccount.type, splits[0].value);
          await db.updateAccount(currentBook.id, fromAccount.id, {
            balance: fromAccount.balance + fromBalanceChange,
            updatedAt: new Date(),
          });
        }

        if (toAccount.type === 'asset' || toAccount.type === 'liability') {
          const toBalanceChange = calculateBalanceChange(toAccount.type, splits[1].value);
          await db.updateAccount(currentBook.id, toAccount.id, {
            balance: toAccount.balance + toBalanceChange,
            updatedAt: new Date(),
          });
        }

        toast.success("Transaction added");
      } catch (error) {
        console.error("Error adding transaction:", error);
        toast.error("Failed to add transaction");
        throw error;
      }
    },
    [user, currentBook, accounts]
  );

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Transaction>) => {
      if (!currentBook) return;

      try {
        await db.updateTransaction(currentBook.id, id, {
          ...updates,
          updatedAt: new Date(),
        });
        toast.success("Transaction updated");
      } catch (error) {
        console.error("Error updating transaction:", error);
        toast.error("Failed to update transaction");
        throw error;
      }
    },
    [currentBook]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!currentBook) return;

      const transaction = transactions.find((t) => t.id === id);
      if (!transaction) return;

      try {
        // Reverse account balance changes
        for (const split of transaction.splits) {
          const account = accounts.find((a) => a.id === split.accountId);
          if (account) {
            const balanceChange = calculateBalanceChange(account.type, split.value);
            await db.updateAccount(currentBook.id, account.id, {
              balance: account.balance - balanceChange,
              updatedAt: new Date(),
            });
          }
        }

        // Delete transaction
        await db.deleteTransaction(currentBook.id, id);
        toast.success("Transaction deleted");
      } catch (error) {
        console.error("Error deleting transaction:", error);
        toast.error("Failed to delete transaction");
        throw error;
      }
    },
    [currentBook, transactions, accounts]
  );

  /**
   * Add a transaction with multiple splits (complex transaction)
   */
  const addSplitTransaction = useCallback(
    async (
      transactionData: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt" | "splits">,
      splitDefinitions: {
        accountId: string;
        accountName: string;
        amount: number;
        type: SplitType;
        memo?: string;
      }[]
    ) => {
      if (!user || !currentBook) {
        toast.error("Please log in and select a book");
        return;
      }

      // Create transaction ID
      const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create splits
      const splits: Split[] = splitDefinitions.map((def, index) => {
        const account = accounts.find((a) => a.id === def.accountId);
        if (!account) {
          throw new Error(`Account not found: ${def.accountId}`);
        }

        return {
          id: `${transactionId}-split-${index + 1}`,
          transactionId,
          accountId: def.accountId,
          accountPath: account.path || account.name,
          accountType: account.type,
          value: def.type === "debit" ? Math.abs(def.amount) : -Math.abs(def.amount),
          memo: def.memo,
        };
      });

      // Validate splits balance
      if (!validateSplitsBalance(splits)) {
        toast.error("Transaction splits don't balance");
        throw new Error("Transaction splits don't balance");
      }

      // Create transaction
      const newTransaction: Transaction = {
        id: transactionId,
        userId: user.uid,
        ...transactionData,
        splits,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        // Save transaction
        await db.createTransaction(currentBook.id, newTransaction);

        // Update account balances for ALL splits
        for (const split of splits) {
          const account = accounts.find((a) => a.id === split.accountId);
          if (account) {
            const balanceChange = calculateBalanceChange(account.type, split.value);
            await db.updateAccount(currentBook.id, account.id, {
              balance: account.balance + balanceChange,
              updatedAt: new Date(),
            });
          }
        }

        toast.success("Transaction added");
      } catch (error) {
        console.error("Error adding transaction:", error);
        toast.error("Failed to add transaction");
        throw error;
      }
    },
    [user, currentBook, accounts]
  );

  // ==================== CATEGORY OPERATIONS ====================

  const addCategory = useCallback(
    async (category: Omit<Category, "id" | "userId">) => {
      if (!user || !currentBook) return;

      const newCategory: Category = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: user.uid,
        ...category,
      };

      try {
        await db.createCategory(currentBook.id, newCategory);
        toast.success("Category created");
        return newCategory.id;
      } catch (error) {
        console.error("Error creating category:", error);
        toast.error("Failed to create category");
        throw error;
      }
    },
    [user, currentBook]
  );

  const updateCategory = useCallback(
    async (id: string, updates: Partial<Category>) => {
      if (!currentBook) return;

      try {
        await db.updateCategory(currentBook.id, id, {
          ...updates,
        });
        toast.success("Category updated");
      } catch (error) {
        console.error("Error updating category:", error);
        toast.error("Failed to update category");
        throw error;
      }
    },
    [currentBook]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      if (!currentBook) return;

      try {
        await db.deleteCategory(currentBook.id, id);
        toast.success("Category deleted");
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("Failed to delete category");
        throw error;
      }
    },
    [currentBook]
  );

  // ==================== HELPER FUNCTIONS ====================

  const getMonthlyData = useCallback(() => {
    const monthlyData: { month: string; income: number; expenses: number }[] = [];
    const last6Months: Date[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      last6Months.push(date);
    }

    last6Months.forEach((date) => {
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const year = date.getFullYear();
      const monthNum = date.getMonth();

      const monthTransactions = transactions.filter((t) => {
        const tDate = t.date instanceof Date ? t.date : new Date(t.date);
        return tDate.getMonth() === monthNum && tDate.getFullYear() === year;
      });

      let income = 0;
      let expenses = 0;

      monthTransactions.forEach((t) => {
        t.splits.forEach((split) => {
          if (split.accountType === "income") {
            income += Math.abs(split.value);
          } else if (split.accountType === "expense") {
            expenses += Math.abs(split.value);
          }
        });
      });

      monthlyData.push({ month, income, expenses });
    });

    return monthlyData;
  }, [transactions]);

  const getCategorySpending = useCallback(() => {
    const categoryTotals: { [key: string]: number } = {};

    transactions.forEach((t) => {
      t.splits.forEach((split) => {
        if (split.accountType === "expense") {
          // Use account path as category
          const category = split.accountPath.split(":")[0] || "Uncategorized";
          categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(split.value);
        }
      });
    });

    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ];

    return Object.entries(categoryTotals).map(([name, value], index) => ({
      name,
      value,
      fill: colors[index % colors.length],
    }));
  }, [transactions]);

  const getAssetAccounts = useCallback(() => {
    return accounts.filter((a) => a.type === "asset");
  }, [accounts]);

  const getIncomeCategories = useCallback(() => {
    return categories.filter((c) => c.type === "income");
  }, [categories]);

  const getExpenseCategories = useCallback(() => {
    return categories.filter((c) => c.type === "expense");
  }, [categories]);

  const getRecentActivities = useCallback(
    (limit: number = 10): Array<(Transaction & { itemType: "transaction" }) | (AccountActivity & { itemType: "activity" })> => {
      // For now, just recent transactions
      // TODO: Add account activities when we implement them
      return transactions.slice(0, limit).map((t) => ({ ...t, itemType: "transaction" as const }));
    },
    [transactions]
  );

  return {
    accounts,
    transactions,
    categories,
    loading,
    getTotalBalance,
    getTotalIncome,
    getTotalExpenses,
    getAccountById,
    addAccount,
    updateAccount,
    deleteAccount,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addSplitTransaction,
    addCategory,
    deleteCategory,
    getMonthlyData,
    getCategorySpending,
    getAssetAccounts,
    getIncomeCategories,
    getExpenseCategories,
    getRecentActivities,
    allAccounts, // Export unified list
  };
  // ==================== BUDGET OPERATIONS ====================

  const [budgets, setBudgets] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !currentBook) {
      setBudgets([]);
      return;
    }

    const unsubBudgets = db.subscribeToBudgets(currentBook.id, (budgetsData: any[]) => {
      setBudgets(budgetsData);
    });

    return () => {
      unsubBudgets();
    };
  }, [user, currentBook]);

  const addBudget = useCallback(
    async (budget: any) => {
      if (!user || !currentBook) return;

      const newBudget = {
        id: `budget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: user.uid,
        bookId: currentBook.id,
        ...budget,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        await db.createBudget(currentBook.id, newBudget);
        toast.success("Budget set successfully");
      } catch (error) {
        console.error("Error creating budget:", error);
        toast.error("Failed to set budget");
        throw error;
      }
    },
    [user, currentBook]
  );

  const updateBudget = useCallback(
    async (id: string, updates: any) => {
      if (!currentBook) return;

      try {
        await db.updateBudget(currentBook.id, id, {
          ...updates,
          updatedAt: new Date(),
        });
        toast.success("Budget updated");
      } catch (error) {
        console.error("Error updating budget:", error);
        toast.error("Failed to update budget");
        throw error;
      }
    },
    [currentBook]
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      if (!currentBook) return;

      try {
        await db.deleteBudget(currentBook.id, id);
        toast.success("Budget deleted");
      } catch (error) {
        console.error("Error deleting budget:", error);
        toast.error("Failed to delete budget");
        throw error;
      }
    },
    [currentBook]
  );

  const getBudgetProgress = useCallback(
    (categoryId: string, amount: number) => {
      // Calculate total expenses for this category in the current month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const spent = transactions
        .filter((t) => {
          const tDate = t.date instanceof Date ? t.date : new Date(t.date);
          return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        })
        .reduce((total, t) => {
          const categorySplits = t.splits.filter((s) => {
            // Check if split matches category ID directly or path
            // For now, let's assume categoryId is the account ID or we check account path prefix
            return s.accountType === "expense" && (s.accountId === categoryId || s.accountPath.startsWith(categories.find(c => c.id === categoryId)?.name || ""));
          });

          return total + categorySplits.reduce((sum, s) => sum + Math.abs(s.value), 0);
        }, 0);

      const percentage = Math.min((spent / amount) * 100, 100);
      return { spent, remaining: amount - spent, percentage };
    },
    [transactions, categories]
  );

  return {
    accounts,
    transactions,
    categories,
    budgets,
    loading,
    getTotalBalance,
    getTotalIncome,
    getTotalExpenses,
    getAccountById,
    addAccount,
    updateAccount,
    deleteAccount,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addSplitTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    addBudget,
    updateBudget,
    deleteBudget,
    getBudgetProgress,
    getMonthlyData,
    getCategorySpending,
    getAssetAccounts,
    getIncomeCategories,
    getExpenseCategories,
    getRecentActivities,
    allAccounts, // Export unified list
  };
}

