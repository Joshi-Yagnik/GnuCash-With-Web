import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { AccountCard } from "@/components/AccountCard";
import { TransactionItem } from "@/components/TransactionItem";
import { SpendingChart } from "@/components/SpendingChart";
import { CategoryChart } from "@/components/CategoryChart";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { SplitTransactionDialog } from "@/components/SplitTransactionDialog";
import { useFinance } from "@/contexts/FinanceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const {
    accounts,
    transactions,
    getTotalBalance,
    getTotalIncome,
    getTotalExpenses,
    deleteAccount
  } = useFinance();

  const totalBalance = getTotalBalance();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const savings = totalIncome - totalExpenses;

  const recentTransactions = transactions.slice(0, 5);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-display font-bold text-foreground"
            >
              Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1"
            >
              Welcome back! Here's your financial overview.
            </motion.p>
          </div>
          <div className="flex gap-2">
            <AddTransactionDialog />
            <SplitTransactionDialog />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Balance" value={totalBalance} type="balance" index={0} />
          <StatCard title="Total Income" value={totalIncome} type="income" index={1} />
          <StatCard title="Total Expenses" value={totalExpenses} type="expense" index={2} />
          <StatCard title="Net Savings" value={savings} type="savings" index={3} />
        </div>

        {/* Accounts Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-foreground">Your Accounts</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              <Plus className="w-4 h-4 mr-1" />
              Add Account
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {accounts.map((account, index) => (
              <AccountCard
                key={account.id}
                account={account}
                index={index}
                onDelete={deleteAccount}
              />
            ))}
          </div>
        </section>

        {/* Charts & Transactions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spending Overview Chart */}
          <Card className="lg:col-span-2 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display">Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <SpendingChart />
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="font-display">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryChart />
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-foreground">Recent Transactions</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              View All
            </Button>
          </div>
          <Card className="shadow-soft">
            <CardContent className="p-4 space-y-3">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions yet. Add your first transaction to get started!
                </div>
              ) : (
                recentTransactions.map((transaction, index) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    index={index}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  );
}
