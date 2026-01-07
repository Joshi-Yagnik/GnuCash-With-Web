import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  type: "balance" | "income" | "expense" | "savings";
  index?: number;
}

const typeConfig = {
  balance: {
    icon: Wallet,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
  income: {
    icon: TrendingUp,
    color: "text-income",
    bgColor: "bg-income/10",
    borderColor: "border-income/20",
  },
  expense: {
    icon: TrendingDown,
    color: "text-expense",
    bgColor: "bg-expense/10",
    borderColor: "border-expense/20",
  },
  savings: {
    icon: PiggyBank,
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/20",
  },
};

export function StatCard({ title, value, type, index = 0 }: StatCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;
  const isNegative = value < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={cn(
        "p-5 rounded-xl bg-card border",
        "shadow-soft hover:shadow-medium transition-all duration-300",
        config.borderColor
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn("p-2.5 rounded-xl", config.bgColor)}>
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground font-medium">{title}</p>
      <p className={cn("text-2xl font-display font-bold mt-1", config.color)}>
        {isNegative ? "-" : ""}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </p>
    </motion.div>
  );
}
