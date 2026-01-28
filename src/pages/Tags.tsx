import { AppLayout } from "@/components/AppLayout";
import { motion } from "framer-motion";
import { Hash, Trash2, Edit2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTags } from "@/hooks/useTags";
import { AddTagDialog } from "@/components/AddTagDialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MobileFAB } from "@/components/mobile/MobileFAB";

export default function Tags() {
    const { tags, loading, deleteTag } = useTags();

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-screen">Loading...</div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-2"
                        >
                            <Hash className="w-6 h-6 md:w-8 md:h-8" />
                            Tags
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: - 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-sm md:text-base text-muted-foreground mt-1"
                        >
                            Organize transactions with flexible tags
                        </motion.p>
                    </div>
                    <div className="hidden md:block">
                        <AddTagDialog />
                    </div>
                </div>

                {tags.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <Hash className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="text-base md:text-lg font-semibold mb-2">No tags yet</h3>
                            <p className="text-sm md:text-base text-muted-foreground max-w-sm mb-6">
                                Create custom tags to organize your transactions better.
                            </p>
                            <div className="hidden md:block">
                                <AddTagDialog />
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {tags.map((tag, index) => (
                            <motion.div
                                key={tag.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-card border rounded-lg p-4 flex items-center justify-between group hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                        style={{ backgroundColor: tag.color }}
                                    >
                                        {tag.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm md:text-base">{tag.name}</h3>
                                        <div className="text-xs text-muted-foreground">
                                            Created {(() => {
                                                const date = tag.createdAt;
                                                // Handle Firestore Timestamp
                                                if (date && typeof (date as any).toDate === 'function') {
                                                    return format((date as any).toDate(), "PP");
                                                }
                                                // Handle Date object or string
                                                const parsedDate = new Date(date);
                                                if (isNaN(parsedDate.getTime())) return "Unknown";
                                                return format(parsedDate, "PP");
                                            })()}
                                        </div>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    {/* Edit Logic could be added here later */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => deleteTag(tag.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile FAB */}
            <MobileFAB icon={<Hash className="w-6 h-6" />} onClick={() => {/* Open add tag */ }} />
        </AppLayout>
    );
}
