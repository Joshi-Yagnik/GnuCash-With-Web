import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Download } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { TransactionItem } from "@/components/TransactionItem";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { MobileFAB } from "@/components/mobile/MobileFAB";
import { useFinance } from "@/contexts/FinanceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionType } from "@/lib/firebaseTypes";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { PullToRefresh } from "@/components/PullToRefresh";
import { inferTransactionType } from "@/lib/accountingUtils";

export default function Transactions() {
  const { transactions, accounts } = useFinance();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleRefresh = async () => {
    // Simulate refresh - in real app, this would refetch from Firebase
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log("Refreshed transactions");
        resolve();
      }, 1000);
    });
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    // For type filter: infer type from splits (income/expense/transfer)
    const inferredType = inferTransactionType(t.splits);
    const matchesType = typeFilter === "all" || inferredType === typeFilter;
    // For account filter: check if any split involves the selected account
    const matchesAccount =
      accountFilter === "all" || t.splits.some((s) => s.accountId === accountFilter);
    return matchesSearch && matchesType && matchesAccount;
  });

  return (
    <AppLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-display font-bold text-foreground"
            >
              Transactions
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm md:text-base text-muted-foreground mt-1"
            >
              View and manage all your transactions.
            </motion.p>
          </div>
          <div className="hidden md:flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <AddTransactionDialog />
          </div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-3 md:flex-row md:gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as TransactionType | "all")}
            >
              <SelectTrigger className="flex-1 md:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger className="flex-1 md:w-[180px]">
                <SelectValue placeholder="Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Transaction List */}
        <Card className="shadow-soft">
          <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-base md:text-lg font-medium">No transactions found</p>
                <p className="text-sm mt-1">
                  Try adjusting your filters or add a new transaction.
                </p>
              </div>
            ) : isMobile ? (
              <PullToRefresh onRefresh={handleRefresh}>
                <div className="space-y-2">
                  {filteredTransactions.map((transaction, index) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      index={index}
                    />
                  ))}
                </div>
              </PullToRefresh>
            ) : (
              filteredTransactions.map((transaction, index) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  index={index}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Transaction Count */}
        <p className="text-xs md:text-sm text-muted-foreground text-center">
          Showing {filteredTransactions.length} of {transactions.length}{" "}
          transactions
        </p>
      </div>

      {/* Mobile FAB */}
      <MobileFAB onClick={() => {/* Open add transaction */ }} />
    </AppLayout>
  );
}
