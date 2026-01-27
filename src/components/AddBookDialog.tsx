import { useState } from "react";
import { useBook } from "@/contexts/BookContext";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Currency } from "@/lib/firebaseTypes";
import { SUPPORTED_CURRENCIES } from "@/lib/currencyUtils";

interface AddBookDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddBookDialog({ open, onOpenChange }: AddBookDialogProps) {
    const { createBook } = useBook();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [currency, setCurrency] = useState<Currency>("INR");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return;

        setLoading(true);
        try {
            await createBook(name.trim(), currency, description.trim() || undefined);

            // Reset form
            setName("");
            setDescription("");
            setCurrency("INR");
            onOpenChange(false);
        } catch (error) {
            console.error("Error creating book:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl">
                        Create New Book
                    </DialogTitle>
                    <DialogDescription>
                        Create a new financial book to organize your accounts and
                        transactions
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Book Name */}
                    <div className="space-y-2">
                        <Label htmlFor="book-name">Book Name *</Label>
                        <Input
                            id="book-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Personal Finance, Business, Family"
                            required
                        />
                    </div>

                    {/* Default Currency */}
                    <div className="space-y-2">
                        <Label htmlFor="currency">Default Currency *</Label>
                        <Select
                            value={currency}
                            onValueChange={(v) => setCurrency(v as Currency)}
                        >
                            <SelectTrigger id="currency">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
                                    <SelectItem key={code} value={code}>
                                        {info.flag} {info.symbol} {info.name} ({code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            This will be the default currency for new accounts in this book
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this book's purpose"
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !name.trim()}>
                            {loading ? "Creating..." : "Create Book"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
