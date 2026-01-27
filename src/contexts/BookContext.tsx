/**
 * Book Context - Manages current active book for the user
 * Provides book switching, creation, and management
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Book } from "@/lib/bookTypes";
import db from "@/lib/database/DatabaseService";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { Currency } from "@/lib/firebaseTypes";
import { initializeBookDefaults } from "@/lib/bookInitialization";

interface BookContextType {
    currentBook: Book | null;
    books: Book[];
    loading: boolean;
    setCurrentBook: (book: Book) => void;
    createBook: (name: string, defaultCurrency: Currency, description?: string) => Promise<void>;
    updateBook: (bookId: string, data: Partial<Book>) => void;
    deleteBook: (bookId: string) => Promise<void>;
    refreshBooks: () => Promise<void>;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [currentBook, setCurrentBook] = useState<Book | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    // Load user's books
    useEffect(() => {
        if (!user) {
            setBooks([]);
            setCurrentBook(null);
            setLoading(false);
            return;
        }

        loadBooks();
    }, [user]);

    const loadBooks = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const userBooks = await db.getUserBooks(user.uid);
            setBooks(userBooks);

            // Set current book (default or first available)
            if (userBooks.length > 0) {
                const defaultBook = userBooks.find((b) => b.isDefault) || userBooks[0];
                setCurrentBook(defaultBook);

                // Store in localStorage for persistence
                localStorage.setItem("currentBookId", defaultBook.id);
            } else {
                // Create default book for new user
                await createDefaultBook();
            }
        } catch (error) {
            console.error("Error loading books:", error);
            toast.error("Failed to load books");
        } finally {
            setLoading(false);
        }
    };

    const createDefaultBook = async () => {
        if (!user) return;

        const defaultBook: Book = {
            id: `book-${Date.now()}`,
            userId: user.uid,
            name: "My Finances",
            description: "Default book",
            defaultCurrency: "INR",
            isDefault: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        try {
            console.log("Creating default book:", defaultBook.id);
            await db.createBook(defaultBook);

            // Initialize book with default accounts and categories
            console.log("Initializing default book with default data...");
            await initializeBookDefaults(defaultBook.id);

            setBooks([defaultBook]);
            setCurrentBook(defaultBook);
            localStorage.setItem("currentBookId", defaultBook.id);
            console.log("✅ Default book created and initialized successfully");
        } catch (error) {
            console.error("Error creating default book:", error);
            toast.error("Failed to create default book");
        }
    };

    const createBook = async (
        name: string,
        defaultCurrency: Currency,
        description?: string
    ) => {
        if (!user) {
            toast.error("You must be logged in to create a book");
            return;
        }

        const newBook: Book = {
            id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId: user.uid,
            name,
            description,
            defaultCurrency,
            isDefault: books.length === 0, // First book is default
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        try {
            console.log("Creating new book:", newBook.id);
            await db.createBook(newBook);

            // Initialize book with default accounts and categories
            console.log("Initializing new book with default data...");
            await initializeBookDefaults(newBook.id);

            setBooks([...books, newBook]);
            toast.success(`Book "${name}" created successfully`);

            // Switch to new book
            setCurrentBook(newBook);
            localStorage.setItem("currentBookId", newBook.id);
            console.log(`✅ Book "${name}" created and initialized successfully`);
        } catch (error) {
            console.error("Error creating book:", error);
            toast.error("Failed to create book");
            throw error;
        }
    };

    const updateBook = async (bookId: string, data: Partial<Book>) => {
        try {
            await db.updateBook(bookId, { ...data, updatedAt: new Date() });

            // Update local state
            setBooks(books.map((b) => (b.id === bookId ? { ...b, ...data } : b)));
            if (currentBook?.id === bookId) {
                setCurrentBook({ ...currentBook, ...data });
            }

            toast.success("Book updated successfully");
        } catch (error) {
            console.error("Error updating book:", error);
            toast.error("Failed to update book");
            throw error;
        }
    };

    const deleteBook = async (bookId: string) => {
        if (books.length <= 1) {
            toast.error("Cannot delete your only book");
            return;
        }

        try {
            await db.deleteBook(bookId);

            const remainingBooks = books.filter((b) => b.id !== bookId);
            setBooks(remainingBooks);

            // If deleted book was current, switch to another
            if (currentBook?.id === bookId) {
                const newCurrent = remainingBooks.find((b) => b.isDefault) || remainingBooks[0];
                setCurrentBook(newCurrent);
                localStorage.setItem("currentBookId", newCurrent.id);
            }

            toast.success("Book deleted successfully");
        } catch (error) {
            console.error("Error deleting book:", error);
            toast.error("Failed to delete book");
            throw error;
        }
    };

    const refreshBooks = async () => {
        await loadBooks();
    };

    return (
        <BookContext.Provider
            value={{
                currentBook,
                books,
                loading,
                setCurrentBook,
                createBook,
                updateBook,
                deleteBook,
                refreshBooks,
            }}
        >
            {children}
        </BookContext.Provider>
    );
}

export function useBook() {
    const context = useContext(BookContext);
    if (context === undefined) {
        throw new Error("useBook must be used within a BookProvider");
    }
    return context;
}
