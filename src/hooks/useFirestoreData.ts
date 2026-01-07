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
import { Account, Transaction, Category, AccountType, TransactionType } from "@/lib/firebaseTypes";

export function useFirestoreData() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to accounts
  useEffect(() => {
    if (!user) {
      setAccounts([]);
      setTransactions([]);
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const accountsQuery = query(
      collection(db, "accounts"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribeAccounts = onSnapshot(accountsQuery, (snapshot) => {
      const accountsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Account[];
      setAccounts(accountsData);
    });

    const transactionsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );

    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Transaction[];
      setTransactions(transactionsData);
    });

    const categoriesQuery = query(
      collection(db, "categories"),
      where("userId", "==", user.uid)
    );

    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
      const categoriesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      setCategories(categoriesData);
      setLoading(false);
    });

    return () => {
      unsubscribeAccounts();
      unsubscribeTransactions();
      unsubscribeCategories();
    };
  }, [user]);

  const getTotalBalance = useCallback(() => {
    return accounts
      .filter((a) => a.type === "asset" || a.type === "liability")
      .reduce((sum, account) => {
        if (account.type === "liability") {
          return sum - account.balance;
        }
        return sum + account.balance;
      }, 0);
  }, [accounts]);

  const getTotalIncome = useCallback(() => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getTotalExpenses = useCallback(() => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

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
      await updateDoc(doc(db, "accounts", id), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    },
    []
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
      
      // Add transaction
      const transactionRef = doc(collection(db, "transactions"));
      batch.set(transactionRef, {
        ...transaction,
        userId: user.uid,
        date: Timestamp.fromDate(transaction.date instanceof Date ? transaction.date : new Date(transaction.date)),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

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
    addCategory,
    deleteCategory,
    getMonthlyData,
    getCategorySpending,
  };
}
