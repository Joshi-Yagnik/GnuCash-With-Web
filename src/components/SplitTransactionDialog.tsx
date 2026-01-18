import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ArrowDownUp, AlertCircle } from "lucide-react";
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
import { SplitType } from "@/lib/firebaseTypes";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SplitEntry {
    accountId: string;
    accountName: string;
    amount: string;
    type: SplitType;
    memo: string;
}

export function SplitTransactionDialog() {
    const { accounts, addSplitTransaction } = useFinance();
    const [open, setOpen] = useState(false);
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [notes, setNotes] = useState("");
    const [splitEntries, setSplitEntries] = useState<SplitEntry[]>([
        { accountId: "", accountName: "", amount: "", type: "debit", memo: "" },
        { accountId: "", accountName: "", amount: "", type: "credit", memo: "" },
    ]);

    const addSplitEntry = () => {
        setSplitEntries([
            ...splitEntries,
            { accountId: "", accountName: "", amount: "", type: "debit", memo: "" },
        ]);
    };

    const removeSplitEntry = (index: number) => {
        if (splitEntries.length > 2) {
            setSplitEntries(splitEntries.filter((_, i) => i !== index));
        }
    };

    const updateSplitEntry = (index: number, field: keyof SplitEntry, value: string) => {
        const updated = [...splitEntries];
        if (field === "accountId") {
            const account = accounts.find((a) => a.id === value);
            updated[index].accountId = value;
            updated[index].accountName = account?.name || "";
        } else {
            updated[index][field] = value as any;
        }
        setSplitEntries(updated);
    };

    const calculateBalance = () => {
        const debits = splitEntries
            .filter((s) => s.type === "debit" && s.amount)
            .reduce((sum, s) => sum + parseFloat(s.amount || "0"), 0);
        const credits = splitEntries
            .filter((s) => s.type === "credit" && s.amount)
            .reduce((sum, s) => sum + parseFloat(s.amount || "0"), 0);
        return { debits, credits, imbalance: debits - credits };
    };

    const { debits, credits, imbalance } = calculateBalance();
    const isBalanced = Math.abs(imbalance) < 0.01;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description || !isBalanced) return;

        const validSplits = splitEntries.filter(
            (s) => s.accountId && s.amount && parseFloat(s.amount) > 0
        );

        if (validSplits.length < 2) {
            alert("At least 2 splits are required");
            return;
        }

        try {
            await addSplitTransaction(
                {
                    description,
                    amount: debits, // Total transaction amount
                    type: "expense", // Default type for split transactions
                    category: category || "Split Transaction",
                    accountId: validSplits[0].accountId, // Primary account
                    date: new Date(),
                    notes: notes || undefined,
                },
                validSplits.map((s) => ({
                    accountId: s.accountId,
                    accountName: s.accountName,
                    amount: parseFloat(s.amount),
                    type: s.type,
                    memo: s.memo || undefined,
                }))
            );

            // Reset form
            setDescription("");
            setCategory("");
            setNotes("");
            setSplitEntries([
                { accountId: "", accountName: "", amount: "", type: "debit", memo: "" },
                { accountId: "", accountName: "", amount: "", type: "credit", memo: "" },
            ]);
            setOpen(false);
        } catch (error: any) {
            alert(error.message || "Failed to create split transaction");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-soft hover:shadow-medium transition-all" variant="outline">
                    <ArrowDownUp className="w-4 h-4" />
                    Split Transaction
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl flex items-center gap-2">
                        <ArrowDownUp className="w-5 h-5" />
                        New Split Transaction
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Split a transaction across multiple accounts with double-entry bookkeeping
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    {/* Transaction Details */}
                    <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                placeholder="e.g., Office Supplies Purchase"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    placeholder="e.g., Business Expense"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (optional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Add any additional notes..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Split Entries */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base">Split Entries</Label>
                            <Button type="button" size="sm" variant="outline" onClick={addSplitEntry}>
                                <Plus className="w-4 h-4 mr-1" />
                                Add Split
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <AnimatePresence mode="popLayout">
                                {splitEntries.map((split, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-4 rounded-lg border bg-card space-y-3"
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Account Selection */}
                                            <div className="flex-1 space-y-2">
                                                <Label className="text-xs">Account</Label>
                                                <Select
                                                    value={split.accountId}
                                                    onValueChange={(value) => updateSplitEntry(index, "accountId", value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select account" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {accounts.map((account) => (
                                                            <SelectItem key={account.id} value={account.id}>
                                                                <div className="flex items-center gap-2">
                                                                    <span
                                                                        className="w-2 h-2 rounded-full"
                                                                        data-color={account.color}
                                                                    />
                                                                    {account.name}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Amount */}
                                            <div className="w-32 space-y-2">
                                                <Label className="text-xs">Amount</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                                        $
                                                    </span>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="0.00"
                                                        className="pl-7"
                                                        value={split.amount}
                                                        onChange={(e) => updateSplitEntry(index, "amount", e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            {/* Debit/Credit Toggle */}
                                            <div className="w-28 space-y-2">
                                                <Label className="text-xs">Type</Label>
                                                <Select
                                                    value={split.type}
                                                    onValueChange={(value) =>
                                                        updateSplitEntry(index, "type", value as SplitType)
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="debit">Debit</SelectItem>
                                                        <SelectItem value="credit">Credit</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Remove Button */}
                                            {splitEntries.length > 2 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="mt-6"
                                                    onClick={() => removeSplitEntry(index)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>

                                        {/* Memo */}
                                        <div className="space-y-2">
                                            <Label className="text-xs">Memo (optional)</Label>
                                            <Input
                                                placeholder="Add a note for this split..."
                                                value={split.memo}
                                                onChange={(e) => updateSplitEntry(index, "memo", e.target.value)}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Balance Info */}
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Debits:</span>
                            <span className="font-medium text-green-600">${debits.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Credits:</span>
                            <span className="font-medium text-blue-600">${credits.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between text-sm font-semibold">
                                <span>Balance:</span>
                                <span
                                    className={cn(
                                        isBalanced ? "text-green-600" : "text-destructive"
                                    )}
                                >
                                    {isBalanced ? "✓ Balanced" : `Imbalance: $${Math.abs(imbalance).toFixed(2)}`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Warning if not balanced */}
                    {!isBalanced && (
                        <Alert variant="destructive">
                            <AlertCircle className="w-4 h-4" />
                            <AlertDescription>
                                Total debits must equal total credits for double-entry bookkeeping.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={!isBalanced}>
                            Create Split Transaction
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
