import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Account, Transaction, Category, AccountType, TransactionType, Split, SplitType, AccountActivity } from "@/lib/firebaseTypes";
import { convertToINR, FALLBACK_EXCHANGE_RATES } from "@/lib/currencyUtils";

export function useFirestoreData() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [splits, setSplits] = useState<Split[]>([]);
  const [accountActivities, setAccountActivities] = useState<AccountActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to accounts
  useEffect(() => {
    if (!user) {
      setAccounts([]);
      setTransactions([]);
      setCategories([]);
      setSplits([]);
      setAccountActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const accountsQuery = query(
      collection(db, "accounts"),
      where("userId", "==", user.uid)
    );

    const unsubscribeAccounts = onSnapshot(accountsQuery, (snapshot) => {
      const accountsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Account[];
      // Sort client-side to avoid needing composite index
      accountsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setAccounts(accountsData);
    });

    const transactionsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
    );

    const unsubscribeTransactions = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const transactionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Transaction[];
        // Sort client-side to avoid needing composite index
        transactionsData.sort((a, b) => b.date.getTime() - a.date.getTime());
        console.log("Transactions loaded:", transactionsData.length, transactionsData);
        setTransactions(transactionsData);
      },
      (error) => {
        console.error("Error loading transactions:", error);
      }
    );

    const categoriesQuery = query(
      collection(db, "categories"),
      where("userId", "==", user.uid)
    );

    const unsubscribeCategories = onSnapshot(
      categoriesQuery,
      (snapshot) => {
        const categoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        console.log("Categories loaded:", categoriesData.length);
        setCategories(categoriesData);
      },
      (error) => {
        console.error("Error loading categories:", error);
      }
    );

    // Subscribe to splits
    const splitsQuery = query(
      collection(db, "splits"),
      where("userId", "==", user.uid)
    );

    const unsubscribeSplits = onSnapshot(
      splitsQuery,
      (snapshot) => {
        const splitsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Split[];
        console.log("Splits loaded:", splitsData.length);
        setSplits(splitsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading splits:", error);
        setLoading(false);
      }
    );

    // Subscribe to account activities
    const activitiesQuery = query(
      collection(db, "accountActivities"),
      where("userId", "==", user.uid)
    );

    const unsubscribeActivities = onSnapshot(
      activitiesQuery,
      (snapshot) => {
        const activitiesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate() || new Date(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as AccountActivity[];
        // Sort by date descending
        activitiesData.sort((a, b) => b.date.getTime() - a.date.getTime());
        console.log("Account activities loaded:", activitiesData.length);
        setAccountActivities(activitiesData);
      },
      (error) => {
        console.error("Error loading account activities:", error);
      }
    );

    return () => {
      unsubscribeAccounts();
      unsubscribeTransactions();
      unsubscribeCategories();
      unsubscribeSplits();
      unsubscribeActivities();
    };
  }, [user]);

  const getTotalBalance = useCallback(() => {
    return accounts
      .filter((a) => a.type === "asset" || a.type === "liability")
      .reduce((sum, account) => {
        // Convert account balance to INR
        const balanceInINR = convertToINR(account.balance, account.currency || 'INR', FALLBACK_EXCHANGE_RATES);

        if (account.type === "liability") {
          return sum - balanceInINR;
        }
        return sum + balanceInINR;
      }, 0);
  }, [accounts]);

  const getTotalIncome = useCallback(() => {
    // Income from transactions
    const incomeTransactions = transactions.filter((t) => t.type === "income");
    const transactionIncome = incomeTransactions.reduce((sum, t) => {
      const amountInINR = convertToINR(t.amount, t.currency || 'INR', FALLBACK_EXCHANGE_RATES);
      return sum + amountInINR;
    }, 0);

    // Income from account balance increases
    const balanceIncreases = accountActivities
      .filter((a) => a.changes.balance && a.changes.balance.new > a.changes.balance.old)
      .reduce((sum, a) => {
        if (a.changes.balance) {
          const increase = a.changes.balance.new - a.changes.balance.old;
          // Get the currency from the activity (new currency if changed, or find the account)
          const currency = a.changes.currency?.new || 'INR';
          const increaseInINR = convertToINR(increase, currency, FALLBACK_EXCHANGE_RATES);
          return sum + increaseInINR;
        }
        return sum;
      }, 0);

    const total = transactionIncome + balanceIncreases;
    console.log("Total Income:", total, "from", incomeTransactions.length, "transactions +", balanceIncreases.toFixed(2), "from balance increases");
    return total;
  }, [transactions, accountActivities]);

  const getTotalExpenses = useCallback(() => {
    // Expenses from transactions
    const expenseTransactions = transactions.filter((t) => t.type === "expense");
    const transactionExpenses = expenseTransactions.reduce((sum, t) => {
      const amountInINR = convertToINR(t.amount, t.currency || 'INR', FALLBACK_EXCHANGE_RATES);
      return sum + amountInINR;
    }, 0);

    // Expenses from account balance decreases
    const balanceDecreases = accountActivities
      .filter((a) => a.changes.balance && a.changes.balance.new < a.changes.balance.old)
      .reduce((sum, a) => {
        if (a.changes.balance) {
          const decrease = a.changes.balance.old - a.changes.balance.new;
          // Get the currency from the activity (old currency if changed)
          const currency = a.changes.currency?.old || 'INR';
          const decreaseInINR = convertToINR(decrease, currency, FALLBACK_EXCHANGE_RATES);
          return sum + decreaseInINR;
        }
        return sum;
      }, 0);

    const total = transactionExpenses + balanceDecreases;
    console.log("Total Expenses:", total, "from", expenseTransactions.length, "transactions +", balanceDecreases.toFixed(2), "from balance decreases");
    console.log("All transactions:", transactions.map(t => ({ id: t.id, type: t.type, amount: t.amount })));
    return total;
  }, [transactions, accountActivities]);

  const getAccountById = useCallback(
    (id: string) => accounts.find((a) => a.id === id),
    [accounts]
  );

  const addAccount = useCallback(
    async (account: Omit<Account, "id" | "userId" | "createdAt" | "updatedAt">) => {
      if (!user) return;

      await addDoc(collection(db, "accounts"), {
        ...account,
        userId: user.uid,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    },
    [user]
  );

  const updateAccount = useCallback(
    async (id: string, updates: Partial<Account>) => {
      if (!user) return;

      // Get the current account to track changes
      const oldAccount = accounts.find((a) => a.id === id);

      // Update the account
      await updateDoc(doc(db, "accounts", id), {
        ...updates,
        updatedAt: Timestamp.now(),
      });

      // Log activity if balance or currency changed
      if (oldAccount && (updates.balance !== undefined || updates.currency !== undefined || updates.name !== undefined)) {
        const changes: AccountActivity['changes'] = {};

        if (updates.balance !== undefined && updates.balance !== oldAccount.balance) {
          changes.balance = { old: oldAccount.balance, new: updates.balance };
        }

        if (updates.currency !== undefined && updates.currency !== oldAccount.currency) {
          changes.currency = { old: oldAccount.currency, new: updates.currency };
        }

        if (updates.name !== undefined && updates.name !== oldAccount.name) {
          changes.name = { old: oldAccount.name, new: updates.name };
        }

        // Only create activity if there are actual changes
        if (Object.keys(changes).length > 0) {
          await addDoc(collection(db, "accountActivities"), {
            userId: user.uid,
            accountId: id,
            accountName: updates.name || oldAccount.name,
            type: changes.balance ? 'balance_update' : changes.currency ? 'currency_update' : 'account_update',
            changes,
            date: Timestamp.now(),
            createdAt: Timestamp.now(),
          });
        }
      }
    },
    [user, accounts]
  );

  const deleteAccount = useCallback(async (id: string) => {
    const batch = writeBatch(db);

    // Delete the account
    batch.delete(doc(db, "accounts", id));

    // Delete related transactions
    const relatedTransactions = transactions.filter(
      (t) => t.accountId === id || t.toAccountId === id
    );
    relatedTransactions.forEach((t) => {
      batch.delete(doc(db, "transactions", t.id));
    });

    await batch.commit();
  }, [transactions]);

  const addTransaction = useCallback(
    async (transaction: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt">) => {
      if (!user) return;

      const batch = writeBatch(db);

      // Add transaction - filter out undefined values
      const transactionRef = doc(collection(db, "transactions"));
      const transactionData: any = {
        userId: user.uid,
        description: transaction.description,
        amount: transaction.amount,
        currency: transaction.currency || 'INR',
        type: transaction.type,
        category: transaction.category,
        accountId: transaction.accountId,
        isSplit: false, // Simple transaction
        date: Timestamp.fromDate(transaction.date instanceof Date ? transaction.date : new Date(transaction.date)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Only add optional fields if they have values
      if (transaction.notes) {
        transactionData.notes = transaction.notes;
      }
      if (transaction.toAccountId) {
        transactionData.toAccountId = transaction.toAccountId;
      }

      batch.set(transactionRef, transactionData);

      // Update account balance
      const account = accounts.find((a) => a.id === transaction.accountId);
      if (account) {
        const balanceChange =
          transaction.type === "income"
            ? transaction.amount
            : transaction.type === "expense"
              ? -transaction.amount
              : -transaction.amount;

        batch.update(doc(db, "accounts", account.id), {
          balance: account.balance + balanceChange,
          updatedAt: Timestamp.now(),
        });
      }

      // For transfers, update destination account
      if (transaction.type === "transfer" && transaction.toAccountId) {
        const toAccount = accounts.find((a) => a.id === transaction.toAccountId);
        if (toAccount) {
          batch.update(doc(db, "accounts", toAccount.id), {
            balance: toAccount.balance + transaction.amount,
            updatedAt: Timestamp.now(),
          });
        }
      }

      await batch.commit();
    },
    [user, accounts]
  );

  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Transaction>) => {
      await updateDoc(doc(db, "transactions", id), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    },
    []
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const transaction = transactions.find((t) => t.id === id);
      if (!transaction) return;

      const batch = writeBatch(db);

      // Delete transaction
      batch.delete(doc(db, "transactions", id));

      // Reverse account balance
      const account = accounts.find((a) => a.id === transaction.accountId);
      if (account) {
        const balanceChange =
          transaction.type === "income"
            ? -transaction.amount
            : transaction.type === "expense"
              ? transaction.amount
              : transaction.amount;

        batch.update(doc(db, "accounts", account.id), {
          balance: account.balance + balanceChange,
          updatedAt: Timestamp.now(),
        });
      }

      // For transfers, reverse destination account
      if (transaction.type === "transfer" && transaction.toAccountId) {
        const toAccount = accounts.find((a) => a.id === transaction.toAccountId);
        if (toAccount) {
          batch.update(doc(db, "accounts", toAccount.id), {
            balance: toAccount.balance - transaction.amount,
            updatedAt: Timestamp.now(),
          });
        }
      }

      await batch.commit();
    },
    [transactions, accounts]
  );

  const addCategory = useCallback(
    async (category: Omit<Category, "id" | "userId">) => {
      if (!user) return;

      await addDoc(collection(db, "categories"), {
        ...category,
        userId: user.uid,
      });
    },
    [user]
  );

  const deleteCategory = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "categories", id));
  }, []);

  // Get monthly data for charts
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

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({ month, income, expenses });
    });

    return monthlyData;
  }, [transactions]);

  // Get category spending data
  const getCategorySpending = useCallback(() => {
    const categoryTotals: { [key: string]: number } = {};

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const category = t.category || "Uncategorized";
        categoryTotals[category] = (categoryTotals[category] || 0) + t.amount;
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

  // Get splits for a transaction
  const getSplitsByTransactionId = useCallback(
    (transactionId: string) => {
      return splits.filter((s) => s.transactionId === transactionId);
    },
    [splits]
  );

  // Helper function to calculate account balance change based on double-entry rules
  const calculateBalanceChange = (accountType: AccountType, splitType: SplitType, amount: number): number => {
    // Asset and Expense accounts: Debit increases, Credit decreases
    // Liability and Income accounts: Credit increases, Debit decreases
    if (accountType === "asset" || accountType === "expense") {
      return splitType === "debit" ? amount : -amount;
    } else {
      return splitType === "credit" ? amount : -amount;
    }
  };

  // Add split transaction with double-entry bookkeeping
  const addSplitTransaction = useCallback(
    async (
      transaction: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt" | "isSplit">,
      splitEntries: Omit<Split, "id" | "transactionId">[]
    ) => {
      if (!user) return;

      // Validate splits balance
      const totalDebits = splitEntries
        .filter((s) => s.type === "debit")
        .reduce((sum, s) => sum + s.amount, 0);
      const totalCredits = splitEntries
        .filter((s) => s.type === "credit")
        .reduce((sum, s) => sum + s.amount, 0);

      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        throw new Error(
          `Splits must balance: debits ($${totalDebits.toFixed(2)}) must equal credits ($${totalCredits.toFixed(2)})`
        );
      }

      const batch = writeBatch(db);

      // Add transaction - filter out undefined values
      const transactionRef = doc(collection(db, "transactions"));
      const transactionData: any = {
        userId: user.uid,
        description: transaction.description,
        amount: transaction.amount,
        currency: transaction.currency || 'INR',
        type: transaction.type,
        category: transaction.category,
        accountId: transaction.accountId,
        isSplit: true,
        date: Timestamp.fromDate(transaction.date instanceof Date ? transaction.date : new Date(transaction.date)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // Only add optional fields if they have values
      if (transaction.notes) {
        transactionData.notes = transaction.notes;
      }
      if (transaction.toAccountId) {
        transactionData.toAccountId = transaction.toAccountId;
      }

      batch.set(transactionRef, transactionData);

      // Add splits and update account balances
      for (const splitEntry of splitEntries) {
        const splitRef = doc(collection(db, "splits"));
        batch.set(splitRef, {
          ...splitEntry,
          transactionId: transactionRef.id,
          userId: user.uid,
        });

        // Update account balance based on double-entry rules
        const account = accounts.find((a) => a.id === splitEntry.accountId);
        if (account) {
          const balanceChange = calculateBalanceChange(account.type, splitEntry.type, splitEntry.amount);
          batch.update(doc(db, "accounts", account.id), {
            balance: account.balance + balanceChange,
            updatedAt: Timestamp.now(),
          });
        }
      }

      await batch.commit();
    },
    [user, accounts]
  );

  // Delete split transaction and reverse balance changes
  const deleteSplitTransaction = useCallback(
    async (transactionId: string) => {
      const transactionSplits = splits.filter((s) => s.transactionId === transactionId);
      if (transactionSplits.length === 0) return;

      const batch = writeBatch(db);

      // Delete transaction
      batch.delete(doc(db, "transactions", transactionId));

      // Delete splits and reverse account balances
      for (const split of transactionSplits) {
        batch.delete(doc(db, "splits", split.id));

        const account = accounts.find((a) => a.id === split.accountId);
        if (account) {
          // Reverse the balance change
          const balanceChange = calculateBalanceChange(account.type, split.type, split.amount);
          batch.update(doc(db, "accounts", account.id), {
            balance: account.balance - balanceChange,
            updatedAt: Timestamp.now(),
          });
        }
      }

      await batch.commit();
    },
    [splits, accounts]
  );

  // Helper functions for transaction forms
  const getAssetAccounts = useCallback(() => {
    return accounts.filter((a) => a.type === "asset");
  }, [accounts]);

  const getIncomeCategories = useCallback(() => {
    return categories.filter((c) => c.type === "income");
  }, [categories]);

  const getExpenseCategories = useCallback(() => {
    return categories.filter((c) => c.type === "expense");
  }, [categories]);

  // Get recent activities and transactions combined
  const getRecentActivities = useCallback((limit: number = 10) => {
    // Combine transactions and account activities
    const combined: Array<(Transaction & { itemType: 'transaction' }) | (AccountActivity & { itemType: 'activity' })> = [
      ...transactions.map(t => ({ ...t, itemType: 'transaction' as const })),
      ...accountActivities.map(a => ({ ...a, itemType: 'activity' as const }))
    ];

    // Sort by date descending
    combined.sort((a, b) => {
      const dateA = a.itemType === 'transaction' ? a.date : a.createdAt;
      const dateB = b.itemType === 'transaction' ? b.date : b.createdAt;
      return dateB.getTime() - dateA.getTime();
    });

    return combined.slice(0, limit);
  }, [transactions, accountActivities]);

  return {
    accounts,
    transactions,
    categories,
    splits,
    accountActivities,
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
    addCategory,
    deleteCategory,
    getMonthlyData,
    getCategorySpending,
    getSplitsByTransactionId,
    addSplitTransaction,
    deleteSplitTransaction,
    getAssetAccounts,
    getIncomeCategories,
    getExpenseCategories,
    getRecentActivities,
  };
}
