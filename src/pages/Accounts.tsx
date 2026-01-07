import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AccountCard } from "@/components/AccountCard";
import { useFinance } from "@/contexts/FinanceContext";
import { Button } from "@/components/ui/button";

export default function Accounts() {
  const { accounts, deleteAccount, getTotalBalance } = useFinance();
  const totalBalance = getTotalBalance();

  const assetAccounts = accounts.filter(a => a.balance >= 0);
  const liabilityAccounts = accounts.filter(a => a.balance < 0);

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
              Accounts
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1"
            >
              Manage all your financial accounts in one place.
            </motion.p>
          </div>
          <Button className="gap-2 shadow-soft hover:shadow-medium transition-all">
            <Plus className="w-4 h-4" />
            Add Account
          </Button>
        </div>

        {/* Total Balance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-glow"
        >
          <p className="text-primary-foreground/80 font-medium">Net Worth</p>
          <p className="text-4xl font-display font-bold mt-1">
            ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-primary-foreground/60 mt-2">
            Across {accounts.length} accounts
          </p>
        </motion.div>

        {/* Asset Accounts */}
        {assetAccounts.length > 0 && (
          <section>
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">
              Assets
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {assetAccounts.map((account, index) => (
                <AccountCard 
                  key={account.id} 
                  account={account} 
                  index={index}
                  onDelete={deleteAccount}
                />
              ))}
            </div>
          </section>
        )}

        {/* Liability Accounts */}
        {liabilityAccounts.length > 0 && (
          <section>
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">
              Liabilities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {liabilityAccounts.map((account, index) => (
                <AccountCard 
                  key={account.id} 
                  account={account} 
                  index={index}
                  onDelete={deleteAccount}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
