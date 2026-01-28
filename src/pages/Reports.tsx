import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { SpendingChart } from "@/components/SpendingChart";
import { CategoryChart } from "@/components/CategoryChart";
import { useFinance } from "@/contexts/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { monthlySpendingData } from "@/lib/mockData";

export default function Reports() {
  const { getTotalIncome, getTotalExpenses } = useFinance();
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const savingsRate = ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1);

  return (
    <AppLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Page Header */}
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-display font-bold text-foreground"
          >
            Reports
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-muted-foreground mt-1"
          >
            Analyze your financial data with detailed reports.
          </motion.p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-soft border-income/20">
              <CardContent className="pt-5 md:pt-6">
                <p className="text-xs md:text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl md:text-3xl font-display font-bold text-income mt-1">
                  ${totalIncome.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-soft border-expense/20">
              <CardContent className="pt-5 md:pt-6">
                <p className="text-xs md:text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl md:text-3xl font-display font-bold text-expense mt-1">
                  ${totalExpenses.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-soft border-accent/20">
              <CardContent className="pt-5 md:pt-6">
                <p className="text-xs md:text-sm text-muted-foreground">Savings Rate</p>
                <p className="text-2xl md:text-3xl font-display font-bold text-accent mt-1">
                  {savingsRate}%
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="overview" className="text-xs md:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="income" className="text-xs md:text-sm">Income</TabsTrigger>
            <TabsTrigger value="expenses" className="text-xs md:text-sm">Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-base md:text-lg font-display">Income vs Expenses Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <SpendingChart />
                </CardContent>
              </Card>
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-base md:text-lg font-display">Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryChart />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="income">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-base md:text-lg font-display">Monthly Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] md:h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySpendingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.75rem",
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Income"]}
                      />
                      <Bar dataKey="income" fill="hsl(145, 60%, 40%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-base md:text-lg font-display">Monthly Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] md:h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlySpendingData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.75rem",
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Expenses"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="hsl(0, 65%, 50%)"
                        strokeWidth={3}
                        dot={{ fill: "hsl(0, 65%, 50%)", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
