import { useState, useEffect } from "react";
import { Plus, Calendar, RotateCcw } from "lucide-react";
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
import { useFinance } from "@/contexts/FinanceContext";
import { useRecurring } from "@/hooks/useRecurring";
import { RecurringFrequency, TransactionType } from "@/lib/firebaseTypes";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const FREQUENCIES: { value: RecurringFrequency; label: string }[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
];

export function AddRecurringTransactionDialog() {
    const { allAccounts, getExpenseCategories, getIncomeCategories } = useFinance();
    const { addRecurringTransaction } = useRecurring();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Transaction Fields
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState<TransactionType>("expense");
    const [accountId, setAccountId] = useState("");
    const [categoryId, setCategoryId] = useState(""); // Destination (Category or Account)

    // Recurring Fields
    const [frequency, setFrequency] = useState<RecurringFrequency>("monthly");
    const [interval, setInterval] = useState(1);
    const [startDate, setStartDate] = useState<Date>(new Date());

    const categories = type === "income" ? getIncomeCategories() : getExpenseCategories();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description || !amount || !accountId || !categoryId) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            // Find accounts
            const fromAccount = allAccounts.find(a => a.id === accountId);
            const toAccount = allAccounts.find(a => a.id === categoryId);

            if (!fromAccount || !toAccount) {
                toast.error("Invalid accounts selected");
                return;
            }

            // Create splits (simplified for now, mimicking addTransaction logic)
            // Ideally we reuse the split creation logic from a helper
            // For recurring, we just store the template splits.

            // Standard Expense: Asset -> Expense (Credit Asset, Debit Expense)
            // Standard Income: Income -> Asset (Credit Income, Debit Asset)
            // Transfer: Asset -> Asset (Credit From, Debit To)

            let splits = [];

            if (type === "expense") {
                splits = [
                    {
                        accountId: fromAccount.id,
                        accountPath: fromAccount.path || fromAccount.name,
                        accountType: fromAccount.type,
                        value: -Math.abs(parseFloat(amount)), // Credit Asset
                    },
                    {
                        accountId: toAccount.id,
                        accountPath: toAccount.path || toAccount.name,
                        accountType: toAccount.type,
                        value: Math.abs(parseFloat(amount)), // Debit Expense
                    }
                ];
            } else if (type === "income") {
                // For income, "accountId" is usually the destination asset, "categoryId" is the source income
                // But our form might reverse this logic visually?
                // Usually "Account" is where money goes/comes, "Category" is the classifications.
                // Let's assume:
                // Expense: Account (Source) -> Category (Destination)
                // Income: Category (Source) -> Account (Destination)

                // If type is income, let's assume user selected "Account" as destination (Asset) and "Category" as source (Income)
                // But my form below uses "Category / Payee" generic.

                // Let's stick to simple logic:
                // From: accountId (Asset), To: categoryId (Expense) for Expense
                // From: categoryId (Income), To: accountId (Asset) for Income

                splits = [
                    {
                        accountId: categoryId, // Income Category
                        accountPath: toAccount.path || toAccount.name, // "toAccount" var name is confusing here, it's the category
                        accountType: toAccount.type,
                        value: -Math.abs(parseFloat(amount)), // Credit Income
                    },
                    {
                        accountId: fromAccount.id, // Asset
                        accountPath: fromAccount.path || fromAccount.name,
                        accountType: fromAccount.type,
                        value: Math.abs(parseFloat(amount)), // Debit Asset
                    }
                ];
            }

            await addRecurringTransaction({
                frequency,
                interval: Number(interval),
                startDate,
                nextRun: startDate, // Start immediately if date is today or past
                active: true,
                template: {
                    description,
                    amount: parseFloat(amount),
                    type,
                    splits,
                    notes: "Recurring Transaction"
                }
            });

            setOpen(false);
            resetForm();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setDescription("");
        setAmount("");
        setType("expense");
        setStartDate(new Date());
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-soft hover:shadow-medium transition-all">
                    <Plus className="w-4 h-4" />
                    New Recurring
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl flex items-center gap-2">
                        <RotateCcw className="w-5 h-5 text-primary" />
                        Setup Recurring Transaction
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">

                    {/* Standard Transaction Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={type} onValueChange={(val: any) => setType(val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="expense">Expense</SelectItem>
                                    <SelectItem value="income">Income</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                min="0" step="0.01"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                            placeholder="e.g. Monthly Rent"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{type === "expense" ? "Pay from (Account)" : "Deposit to (Account)"}</Label>
                            <Select value={accountId} onValueChange={setAccountId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allAccounts.filter(a => a.type === "asset" || a.type === "liability").map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>
                                            {acc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{type === "expense" ? "Category" : "Source"}</Label>
                            <Select value={categoryId} onValueChange={setCategoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Recurring Schedule Fields */}
                    <div className="border-t pt-4 mt-4">
                        <Label className="text-base font-semibold mb-3 block">Schedule</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Frequency</Label>
                                <Select value={frequency} onValueChange={(val: any) => setFrequency(val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {FREQUENCIES.map(f => (
                                            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Interval (Every X {frequency})</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={interval}
                                    onChange={e => setInterval(parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 mt-4">
                            <Label>Start Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <CalendarComponent
                                        mode="single"
                                        selected={startDate}
                                        onSelect={(date) => date && setStartDate(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Schedule"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
