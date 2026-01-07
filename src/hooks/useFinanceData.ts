import { useState, useCallback } from "react";
import { Account, Transaction, mockAccounts, mockTransactions } from "@/lib/mockData";

export function useFinanceData() {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  const getTotalBalance = useCallback(() => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
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

  const addTransaction = useCallback((transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);

    // Update account balance
    setAccounts((prev) =>
      prev.map((account) => {
        if (account.id === transaction.accountId) {
          const change =
            transaction.type === "income"
              ? transaction.amount
              : transaction.type === "expense"
              ? -transaction.amount
              : -transaction.amount;
          return { ...account, balance: account.balance + change };
        }
        if (
          transaction.type === "transfer" &&
          account.id === transaction.toAccountId
        ) {
          return { ...account, balance: account.balance + transaction.amount };
        }
        return account;
      })
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    // Reverse account balance
    setAccounts((prev) =>
      prev.map((account) => {
        if (account.id === transaction.accountId) {
          const change =
            transaction.type === "income"
              ? -transaction.amount
              : transaction.type === "expense"
              ? transaction.amount
              : transaction.amount;
          return { ...account, balance: account.balance + change };
        }
        if (
          transaction.type === "transfer" &&
          account.id === transaction.toAccountId
        ) {
          return { ...account, balance: account.balance - transaction.amount };
        }
        return account;
      })
    );
  }, [transactions]);

  const addAccount = useCallback((account: Omit<Account, "id">) => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
    };
    setAccounts((prev) => [...prev, newAccount]);
  }, []);

  const deleteAccount = useCallback((id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setTransactions((prev) =>
      prev.filter((t) => t.accountId !== id && t.toAccountId !== id)
    );
  }, []);

  return {
    accounts,
    transactions,
    getTotalBalance,
    getTotalIncome,
    getTotalExpenses,
    getAccountById,
    addTransaction,
    deleteTransaction,
    addAccount,
    deleteAccount,
  };
}
