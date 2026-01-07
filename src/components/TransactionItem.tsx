import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft,
  Trash2 
} from "lucide-react";
import { Transaction } from "@/lib/firebaseTypes";
import { useFinance } from "@/contexts/FinanceContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TransactionItemProps {
  transaction: Transaction;
  index?: number;
}

const typeConfig = {
  income: {
    icon: TrendingUp,
    color: "text-income",
    bgColor: "bg-income/10",
    label: "Income",
  },
  expense: {
    icon: TrendingDown,
    color: "text-expense",
    bgColor: "bg-expense/10",
    label: "Expense",
  },
  transfer: {
    icon: ArrowRightLeft,
    color: "text-transfer",
    bgColor: "bg-transfer/10",
    label: "Transfer",
  },
};

export function TransactionItem({ transaction, index = 0 }: TransactionItemProps) {
  const { getAccountById, deleteTransaction } = useFinance();
  const config = typeConfig[transaction.type];
  const Icon = config.icon;
  const account = getAccountById(transaction.accountId);
  const toAccount = transaction.toAccountId 
    ? getAccountById(transaction.toAccountId) 
    : null;

  const formattedDate = format(new Date(transaction.date), "MMM dd, yyyy");

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        "flex items-center justify-between p-4 rounded-xl",
        "bg-card hover:bg-muted/50 transition-all duration-200",
        "border border-border/50 hover:border-border",
        "group cursor-pointer"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn("p-2.5 rounded-xl", config.bgColor)}>
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>
        <div>
          <p className="font-medium text-foreground">{transaction.description}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-muted-foreground">{account?.name}</span>
            {toAccount && (
              <>
                <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{toAccount.name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={cn("font-semibold", config.color)}>
            {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}
            ${transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            deleteTransaction(transaction.id);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
