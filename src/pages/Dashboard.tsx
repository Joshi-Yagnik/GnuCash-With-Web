import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { AccountCard } from "@/components/AccountCard";
import { TransactionItem } from "@/components/TransactionItem";
import { AccountActivityItem } from "@/components/AccountActivityItem";
import { SpendingChart } from "@/components/SpendingChart";
import { CategoryChart } from "@/components/CategoryChart";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { AddAccountDialog } from "@/components/AddAccountDialog";
import { SplitTransactionDialog } from "@/components/SplitTransactionDialog";
import { useEffect } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { useRecurring } from "@/hooks/useRecurring";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const {
    accounts,
    getTotalBalance,
    getTotalIncome,
    getTotalExpenses,
    deleteAccount,
    getRecentActivities
  } = useFinance();

  const { processDueTransactions } = useRecurring();

  useEffect(() => {
    processDueTransactions();
  }, [processDueTransactions]);

  const totalBalance = getTotalBalance();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const savings = totalIncome - totalExpenses;

  const recentItems = getRecentActivities(5);

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
            <AddAccountDialog />
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
            <h2 className="text-xl font-display font-semibold text-foreground">Recent Activity</h2>
            <Button variant="ghost" size="sm" className="text-primary">
              View All
            </Button>
          </div>
          <Card className="shadow-soft">
            <CardContent className="p-4 space-y-3">
              {recentItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No activity yet. Add your first transaction or account to get started!
                </div>
              ) : (
                recentItems.map((item, index) => (
                  item.itemType === 'transaction' ? (
                    <TransactionItem
                      key={item.id}
                      transaction={item}
                      index={index}
                    />
                  ) : item.itemType === 'activity' ? (
                    <AccountActivityItem
                      key={item.id}
                      activity={item}
                      index={index}
                    />
                  ) : null
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  );
}
