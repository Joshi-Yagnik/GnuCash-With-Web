/**
 * Simplified Transaction Dialog - GnuCash Style
 * Matches the screenshot design with minimal fields
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { useFinance } from "@/contexts/FinanceContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currencyUtils";

interface SimplifiedTransactionDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultAccountId?: string;
}

export function SimplifiedTransactionDialog({
    open: controlledOpen,
    onOpenChange,
    defaultAccountId,
}: SimplifiedTransactionDialogProps = {}) {
    const { accounts, addTransaction } = useFinance();
    const [internalOpen, setInternalOpen] = useState(false);

    // Form state
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [isReceive, setIsReceive] = useState(false); // false = Pay, true = Receive
    const [fromAccountId, setFromAccountId] = useState(defaultAccountId || "");
    const [toAccountId, setToAccountId] = useState("");
    const [date, setDate] = useState<Date>(new Date());
    const [time, setTime] = useState(format(new Date(), "HH:mm"));
    const [number, setNumber] = useState(""); // Check/receipt number
    const [notes, setNotes] = useState("");

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description || !amount || !fromAccountId || !toAccountId) {
            return;
        }

        // Combine date and time
        const [hours, minutes] = time.split(":");
        const transactionDate = new Date(date);
        transactionDate.setHours(parseInt(hours), parseInt(minutes));

        try {
            await addTransaction({
                description,
                amount: parseFloat(amount),
                fromAccountId,
                toAccountId,
                date: transactionDate,
                number: number || undefined,
                notes: notes || undefined,
            });

            // Reset form
            setDescription("");
            setAmount("");
            setFromAccountId(defaultAccountId || "");
            setToAccountId("");
            setDate(new Date());
            setTime(format(new Date(), "HH:mm"));
            setNumber("");
            setNotes("");
            setOpen(false);
        } catch (error) {
            console.error("Error adding transaction:", error);
        }
    };

    const assetAccounts = accounts.filter((a) => a.type === "asset");
    const expenseAccounts = accounts.filter((a) => a.type === "expense");
    const incomeAccounts = accounts.filter((a) => a.type === "income");

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!controlledOpen && (
                <DialogTrigger asChild>
                    <Button className="gap-2 shadow-soft hover:shadow-medium transition-all">
                        <Plus className="w-4 h-4" />
                        New Transaction
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl text-primary">
                        New transaction
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-amber-600">Description</Label>
                        <Input
                            id="description"
                            placeholder="e.g., Groceries, Salary, Rent"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="border-b-2 border-amber-400 focus-visible:border-amber-600"
                        />
                    </div>

                    {/* Amount with Receive/Pay Toggle */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="amount">Amount</Label>
                            <div className="flex items-center gap-2">
                                <span className={cn("text-sm", !isReceive && "text-destructive font-medium")}>
                                    Pay
                                </span>
                                <Switch
                                    checked={isReceive}
                                    onCheckedChange={setIsReceive}
                                    className="data-[state=checked]:bg-success"
                                />
                                <span className={cn("text-sm", isReceive && "text-success font-medium")}>
                                    Receive
                                </span>
                            </div>
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                ₹
                            </span>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-8"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* From Account (Payment source or Income account) */}
                    <div className="space-y-2">
                        <Label htmlFor="from-account">
                            {isReceive ? "From (Income)" : "From (Payment)"}
                        </Label>
                        <Select value={fromAccountId} onValueChange={setFromAccountId} required>
                            <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                                {isReceive
                                    ? incomeAccounts.map((account) => (
                                        <SelectItem key={account.id} value={account.id}>
                                            <div className="flex items-center gap-2">
                                                <span>{account.path || account.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatCurrency(account.balance, account.currency)}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))
                                    : assetAccounts.map((account) => (
                                        <SelectItem key={account.id} value={account.id}>
                                            <div className="flex items-center gap-2">
                                                <span>{account.path || account.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatCurrency(account.balance, account.currency)}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* To Account (Destination or Expense account) */}
                    <div className="space-y-2">
                        <Label htmlFor="to-account">
                            {isReceive ? "To (Asset)" : "To (Expense)"}
                        </Label>
                        <Select value={toAccountId} onValueChange={setToAccountId} required>
                            <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                                {isReceive
                                    ? assetAccounts.map((account) => (
                                        <SelectItem key={account.id} value={account.id}>
                                            <div className="flex items-center gap-2">
                                                <span>{account.path || account.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatCurrency(account.balance, account.currency)}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))
                                    : expenseAccounts.map((account) => (
                                        <SelectItem key={account.id} value={account.id}>
                                            {account.path || account.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "dd MMM yyyy") : "Pick date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="time">Time</Label>
                            <Input
                                id="time"
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Number (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="number" className="text-sm">Number (Optional)</Label>
                        <Input
                            id="number"
                            placeholder="Check/Receipt number"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                        />
                    </div>

                    {/* Notes (Optional) */}
                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-sm">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Additional notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            className="resize-none"
                        />
                    </div>

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
                        <Button type="submit" className="flex-1">
                            ✓ Add Transaction
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
