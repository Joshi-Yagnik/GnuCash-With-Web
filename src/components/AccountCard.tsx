import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Building2,
  CreditCard,
  TrendingUp,
  MoreVertical,
  Star,
} from "lucide-react";
import { Account } from "@/lib/firebaseTypes";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EditAccountDialog } from "./EditAccountDialog";
import { AccountDetailSheet } from "./AccountDetailSheet";
import { formatCurrency, formatWithINREquivalent } from "@/lib/currencyUtils";
import { useFavoriteAccounts } from "@/hooks/useFavoriteAccounts";
import { useRecentAccounts } from "@/hooks/useRecentAccounts";

interface AccountCardProps {
  account: Account;
  index?: number;
  onDelete?: (id: string) => void;
}

const iconMap = {
  wallet: Wallet,
  building: Building2,
  credit: CreditCard,
  trending: TrendingUp,
};

const colorMap: Record<string, string> = {
  primary: "from-primary/90 to-primary",
  accent: "from-accent/90 to-accent",
  success: "from-success/90 to-success",
  destructive: "from-destructive/90 to-destructive",
  "chart-3": "from-transfer/90 to-transfer",
};

export function AccountCard({ account, index = 0, onDelete }: AccountCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const { isFavorite, toggleFavorite } = useFavoriteAccounts();
  const { trackAccountAccess } = useRecentAccounts();
  const Icon = iconMap[account.icon as keyof typeof iconMap] || Wallet;
  const gradientClass = colorMap[account.color] || colorMap.primary;
  const isNegative = account.balance < 0;
  const accountIsFavorite = isFavorite(account.id);

  const handleCardClick = () => {
    setDetailOpen(true);
    trackAccountAccess(account.id);
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(account.id);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        onClick={handleCardClick}
        className={cn(
          "relative overflow-hidden rounded-xl p-5 text-primary-foreground",
          "bg-gradient-to-br shadow-soft hover:shadow-medium transition-all duration-300",
          "hover:scale-[1.02] cursor-pointer group",
          gradientClass
        )}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1">
              {/* Favorite Star */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleFavoriteToggle}
              >
                <Star
                  className={cn(
                    "w-4 h-4",
                    accountIsFavorite && "fill-current text-yellow-300"
                  )}
                />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setEditOpen(true);
                  }}>
                    Edit Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick();
                  }}>
                    View Transactions
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(account.id);
                    }}
                  >
                    <Star className={cn("w-4 h-4 mr-2", accountIsFavorite && "fill-current")} />
                    {accountIsFavorite ? "Remove from Favorites" : "Add to Favorites"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(account.id);
                    }}
                  >
                    Delete Account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <p className="text-sm text-white/80 font-medium mb-1">{account.name}</p>
          <p className="text-2xl font-display font-bold tracking-tight">
            {formatCurrency(account.balance, account.currency || 'INR')}
          </p>
          {account.currency && account.currency !== 'INR' && (
            <p className="text-xs text-white/70 mt-1">
              {formatWithINREquivalent(account.balance, account.currency)}
            </p>
          )}
          <p className="text-xs text-white/60 mt-2 capitalize">{account.type} Account</p>
        </div>
      </motion.div>

      <EditAccountDialog
        account={account}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AccountDetailSheet
        account={account}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
