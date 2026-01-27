import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useBook } from "@/contexts/BookContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Star, Calendar, BookOpen } from "lucide-react";
import { AddBookDialog } from "@/components/AddBookDialog";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function BooksPage() {
    const { books, currentBook, setCurrentBook, deleteBook, loading } = useBook();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState<string | null>(null);

    // Debugging logs
    console.log("BooksPage rendering. Loading:", loading, "Books count:", books.length);

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading books...</span>
                </div>
            </AppLayout>
        );
    }

    const handleDelete = async () => {
        if (bookToDelete) {
            await deleteBook(bookToDelete);
            setBookToDelete(null);
            setDeleteDialogOpen(false);
        }
    };

    // Helper to safely format dates
    const formatDateSafe = (date: any) => {
        if (!date) return "Unknown Date";
        try {
            // Handle Firestore Timestamp
            if (date.toDate && typeof date.toDate === 'function') {
                return format(date.toDate(), "MMM d, yyyy");
            }
            // Handle standard Date object or string
            return format(new Date(date), "MMM d, yyyy");
        } catch (e) {
            console.error("Date formatting error:", e, date);
            return "Invalid Date";
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-display font-bold text-foreground flex items-center gap-2"
                        >
                            <BookOpen className="w-8 h-8" />
                            My Books
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground mt-1"
                        >
                            Manage your financial books and switch between them
                        </motion.p>
                    </div>
                    <Button onClick={() => setDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Book
                    </Button>
                </div>

                {/* Books Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.map((book) => (
                        <Card
                            key={book.id}
                            className={`flex flex-col shadow-sm transition-all hover:shadow-md ${book.id === currentBook?.id
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                : "hover:border-primary/50"
                                }`}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-xl font-display">{book.name}</h3>
                                    {book.id === currentBook?.id && (
                                        <Badge className="bg-primary">Active</Badge>
                                    )}
                                </div>
                                <div className="flex gap-2 mt-1">
                                    {book.isDefault && (
                                        <Badge variant="secondary" className="gap-1 text-xs">
                                            <Star className="w-3 h-3" /> Default
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                        {book.defaultCurrency}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-between pt-0">
                                <div>
                                    {book.description ? (
                                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                                            {book.description}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic min-h-[2.5rem]">
                                            No description
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4 mb-4">
                                        <Calendar className="w-3 h-3" />
                                        Created {formatDateSafe(book.createdAt)}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-border/50">
                                    {book.id !== currentBook?.id ? (
                                        <Button
                                            className="flex-1"
                                            variant="secondary"
                                            onClick={() => setCurrentBook(book)}
                                        >
                                            Switch To
                                        </Button>
                                    ) : (
                                        <Button className="flex-1" disabled variant="outline">
                                            Current Book
                                        </Button>
                                    )}

                                    {books.length > 1 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                setBookToDelete(book.id);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Add Book Card Button */}
                    <button
                        onClick={() => setDialogOpen(true)}
                        className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30 transition-all group h-full min-h-[200px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-colors">
                            <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <h3 className="font-semibold text-lg">Create New Book</h3>
                        <p className="text-sm text-muted-foreground mt-1">Start a fresh ledger</p>
                    </button>
                </div>

                {/* Info Card */}
                <Card className="bg-muted/30 border-none">
                    <CardContent className="p-4 flex gap-3">
                        <div className="p-2 bg-primary/10 rounded-full h-fit">
                            <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-medium text-sm mb-1">About Books</h4>
                            <p className="text-sm text-muted-foreground">
                                Books allow you to keep completely separate financial records.
                                Use them to separate personal finances from business expenses,
                                or track finances for different family members.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Book Dialog */}
                <AddBookDialog open={dialogOpen} onOpenChange={setDialogOpen} />

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this book and all its accounts,
                                transactions, and categories. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete Book
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
