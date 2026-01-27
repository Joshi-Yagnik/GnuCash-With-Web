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
import { inferTransactionType } from "@/lib/accountingUtils";

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

  // Derive display properties from splits (Double-Entry Logic)
  // TODO: Pass viewedAccountId prop if we want account-specific perspective (e.g. Red/Green based on debit/credit)
  // For global view, we infer based on account types involved.

  // Helper to get type
  const displayType = (transaction as any).type || inferTransactionType(transaction.splits);

  // Helper to get amount (use positive value of the transaction)
  // For simple transactions, it's the absolute value of any split
  const displayAmount = (transaction as any).amount ??
    Math.max(...transaction.splits.map(s => Math.abs(s.value)));

  const config = typeConfig[displayType] || typeConfig.transfer;
  const Icon = config.icon;

  // Identify accounts for display
  // We need to find "The Account" and "The Other Account"
  // For global view:
  // Income: From Income Account -> To Asset Account
  // Expense: From Asset Account -> To Expense Account
  // Transfer: From Asset A -> To Asset B

  let primaryAccountName = "Unknown";
  let secondaryAccountName = null;

  if (transaction.splits && transaction.splits.length > 0) {
    if (displayType === 'income') {
      // Primary: Where money went (Asset)
      // Secondary: Where it came from (Income)
      const assetSplit = transaction.splits.find(s => s.accountType === 'asset');
      const incomeSplit = transaction.splits.find(s => s.accountType === 'income');
      primaryAccountName = assetSplit?.accountPath || getAccountById(assetSplit?.accountId || "")?.name || "Asset";
      secondaryAccountName = incomeSplit?.accountPath || getAccountById(incomeSplit?.accountId || "")?.name || "Income";
    } else if (displayType === 'expense') {
      // Primary: Where it went (Expense)
      // Secondary: Where money came from (Asset)
      const expenseSplit = transaction.splits.find(s => s.accountType === 'expense');
      const assetSplit = transaction.splits.find(s => s.accountType === 'asset');
      // Swap names for display usually logic is "Paid to Expense using Asset"
      // So "Expense Name" is primary? Or "Asset Name"?
      // Existing UI shows "Account" then "To Account".
      primaryAccountName = assetSplit?.accountPath || getAccountById(assetSplit?.accountId || "")?.name || "Asset";
      secondaryAccountName = expenseSplit?.accountPath || getAccountById(expenseSplit?.accountId || "")?.name || "Expense";
    } else {
      // Transfer
      // Just take first two splits
      const split1 = transaction.splits[0];
      const split2 = transaction.splits[1];
      // Try to make source first? (Negative value)
      const source = split1.value < 0 ? split1 : split2;
      const dest = split1.value < 0 ? split2 : split1;

      primaryAccountName = source?.accountPath || getAccountById(source?.accountId || "")?.name || "From";
      secondaryAccountName = dest?.accountPath || getAccountById(dest?.accountId || "")?.name || "To";
    }
  } else {
    // Legacy fallback
    const acct = getAccountById((transaction as any).accountId);
    const toAcct = (transaction as any).toAccountId ? getAccountById((transaction as any).toAccountId) : null;
    primaryAccountName = acct?.name || "Unknown";
    secondaryAccountName = toAcct?.name;
    if (!secondaryAccountName && (transaction as any).category) {
      secondaryAccountName = (transaction as any).category;
    }
  }

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
            {/* Split badge? transaction.splits.length > 2? */}
            {transaction.splits && transaction.splits.length > 2 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Split className="w-3 h-3" />
                <span>Split</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-muted-foreground">{primaryAccountName}</span>
            {secondaryAccountName && (
              <>
                <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{secondaryAccountName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={cn("font-semibold", config.color)}>
            {displayType === "income" ? "+" : displayType === "expense" ? "-" : ""}
            {formatCurrency(displayAmount, transaction.currency || 'INR')}
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
