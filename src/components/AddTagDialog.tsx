import { useState } from "react";
import { Plus, Tag as TagIcon, Hash } from "lucide-react";
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
import { useTags } from "@/hooks/useTags";
import { toast } from "sonner";

const PRESET_COLORS = [
    "#ef4444", // red-500
    "#f97316", // orange-500
    "#eab308", // yellow-500
    "#22c55e", // green-500
    "#14b8a6", // teal-500
    "#3b82f6", // blue-500
    "#6366f1", // indigo-500
    "#a855f7", // purple-500
    "#ec4899", // pink-500
    "#64748b", // slate-500
];

export function AddTagDialog() {
    const { addTag } = useTags();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [color, setColor] = useState(PRESET_COLORS[5]); // Default blue
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Please enter a tag name");
            return;
        }

        setLoading(true);

        try {
            await addTag({
                name: name.trim(),
                color,
            });
            setOpen(false);
            setName("");
            setColor(PRESET_COLORS[5]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-soft hover:shadow-medium transition-all">
                    <Plus className="w-4 h-4" />
                    New Tag
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="font-display text-xl flex items-center gap-2">
                        <Hash className="w-5 h-5 text-primary" />
                        Create New Tag
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Tag Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Travel, Urgent, Side Hustle"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Color Code</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    aria-label={`Select color ${c}`}
                                    title={`Select color ${c}`}
                                    className={`w-6 h-6 rounded-full border border-gray-200 transition-all ${color === c ? "ring-2 ring-primary ring-offset-2 scale-110" : "hover:scale-110"
                                        }`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setColor(c)}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-10 h-10 rounded border"
                                style={{ backgroundColor: color }}
                            />
                            <Input
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                placeholder="#000000"
                                className="font-mono uppercase"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Tag"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
