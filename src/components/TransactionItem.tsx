import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Trash2,
  Pencil,
  Split
} from "lucide-react";
import { Transaction } from "@/lib/firebaseTypes";
import { useFinance } from "@/contexts/FinanceContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EditTransactionDialog } from "./EditTransactionDialog";
import { formatCurrency } from "@/lib/currencyUtils";

interface TransactionItemProps {
  transaction: Transaction;
  index?: number;
}

const typeConfig = {
  income: {
    icon: ArrowUpRight,
    color: "text-income",
    bgColor: "bg-income/10",
    label: "Income",
  },
  expense: {
    icon: ArrowDownLeft,
    color: "text-expense",
    bgColor: "bg-expense/10",
    label: "Expense",
  },
  transfer: {
    icon: ArrowLeftRight,
    color: "text-transfer",
    bgColor: "bg-transfer/10",
    label: "Transfer",
  },
};

export function TransactionItem({ transaction, index = 0 }: TransactionItemProps) {
  const { getAccountById, deleteTransaction } = useFinance();
  const [editOpen, setEditOpen] = useState(false);
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
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{transaction.description}</p>
            {transaction.isSplit && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Split className="w-3 h-3" />
                <span>Split</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-muted-foreground">{account?.name}</span>
            {toAccount && (
              <>
                <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
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
            {formatCurrency(transaction.amount, transaction.currency || 'INR')}
          </p>
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            setEditOpen(true);
          }}
        >
          <Pencil className="w-4 h-4" />
        </Button>
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

      <EditTransactionDialog
        transaction={transaction}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </motion.div>
  );
}
