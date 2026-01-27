import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFinance } from "@/contexts/FinanceContext";
import { Currency } from "@/lib/firebaseTypes";
import { getCurrencySymbol } from "@/lib/currencyUtils";

export function AddTransactionDialog() {
  const { allAccounts, addTransaction, getAccountById } = useFinance();
  // Fallback to accounts or just use allAccounts exclusively.
  // Ideally getAccountById logic needs update too if it relies on accounts list?
  // getAccountById uses `accounts` in hook. I should update getAccountById in hook to use allAccounts too or update it locally.
  // Actually, getAccountById should look in allAccounts. I'll update the hook for that separately.
  // For now, let's assume getAccountById works or I won't rely on it for currency if it's a category.
  const accounts = allAccounts; // Use unified list locally
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [number, setNumber] = useState("");
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount || !fromAccountId || !toAccountId) return;

    try {
      await addTransaction({
        description,
        amount: parseFloat(amount),
        fromAccountId,
        toAccountId,
        date: new Date(date),
        number: number || undefined,
        notes: notes || undefined,
      });

      // Reset form
      setDescription("");
      setAmount("");
      setFromAccountId("");
      setToAccountId("");
      setNumber("");
      setNotes("");
      setOpen(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const selectedFromAccount = getAccountById(fromAccountId);
  const currency = selectedFromAccount?.currency || "INR";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-soft hover:shadow-medium transition-all">
          <Plus className="w-4 h-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">New Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Reference #</Label>
              <Input
                id="number"
                placeholder="Check/Receipt #"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g. Monthly Salary, Grocery Shopping"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromAccount">From Account</Label>
            <Select value={fromAccountId} onValueChange={setFromAccountId} required>
              <SelectTrigger>
                <SelectValue placeholder="Source of funds..." />
              </SelectTrigger>
              <SelectContent>
                {["asset", "liability", "income", "expense"].map((type) => {
                  const accountsOfType = allAccounts.filter(a => a.type === type);
                  if (accountsOfType.length === 0) return null;
                  return (
                    <div key={type}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase bg-muted/50">
                        {type}s
                      </div>
                      {accountsOfType.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                          {!account.isCategory && ` (${getCurrencySymbol(account.currency || 'INR')})`}
                        </SelectItem>
                      ))}
                    </div>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground px-1">
              Select where the money is coming <strong>FROM</strong> (e.g. Salary, Bank)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toAccount">To Account</Label>
            <Select value={toAccountId} onValueChange={setToAccountId} required>
              <SelectTrigger>
                <SelectValue placeholder="Destination of funds..." />
              </SelectTrigger>
              <SelectContent>
                {["asset", "liability", "expense", "income"].map((type) => {
                  const accountsOfType = allAccounts.filter(a => a.type === type);
                  if (accountsOfType.length === 0) return null;
                  return (
                    <div key={type}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase bg-muted/50">
                        {type}s
                      </div>
                      {accountsOfType.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                          {!account.isCategory && ` (${getCurrencySymbol(account.currency || 'INR')})`}
                        </SelectItem>
                      ))}
                    </div>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground px-1">
              Select where the money is going <strong>TO</strong> (e.g. Bank, Groceries)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {getCurrencySymbol(currency)}
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="pl-10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

