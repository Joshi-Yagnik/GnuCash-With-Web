import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBook } from "@/contexts/BookContext";
import { Tag } from "@/lib/firebaseTypes";
import db from "@/lib/database/DatabaseService";
import { toast } from "sonner";

export function useTags() {
    const { user } = useAuth();
    const { currentBook } = useBook();
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch tags on mount and when book changes
    useEffect(() => {
        if (!user || !currentBook) {
            setTags([]);
            setLoading(false);
            return;
        }

        const fetchTags = async () => {
            setLoading(true);
            try {
                const fetchedTags = await db.getTags(currentBook.id);
                setTags(fetchedTags);
            } catch (error) {
                console.error("Error fetching tags:", error);
                toast.error("Failed to load tags");
            } finally {
                setLoading(false);
            }
        };

        fetchTags();

        // No subscription for now, can add later if real-time needed
        // Actually, let's just make it a one-time fetch or manual refresh for now to keep it simple
        // Or better: manual refresh function
    }, [user, currentBook]);

    // CRUD Operations
    const addTag = useCallback(async (tagData: Omit<Tag, "id" | "userId" | "bookId" | "createdAt" | "updatedAt">) => {
        if (!user || !currentBook) return;

        const newTag: Tag = {
            id: `tag-${Date.now()}`,
            userId: user.uid,
            bookId: currentBook.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...tagData
        };

        try {
            await db.createTag(currentBook.id, newTag);
            setTags(prev => [...prev, newTag]);
            toast.success("Tag created");
        } catch (error) {
            console.error(error);
            toast.error("Failed to create tag");
        }
    }, [user, currentBook]);

    const updateTag = useCallback(async (id: string, updates: Partial<Tag>) => {
        if (!currentBook) return;
        try {
            await db.updateTag(currentBook.id, id, { ...updates, updatedAt: new Date() });
            setTags(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t));
            toast.success("Tag updated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update tag");
        }
    }, [currentBook]);

    const deleteTag = useCallback(async (id: string) => {
        if (!currentBook) return;
        try {
            await db.deleteTag(currentBook.id, id);
            setTags(prev => prev.filter(t => t.id !== id));
            toast.success("Tag deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete tag");
        }
    }, [currentBook]);

    return {
        tags,
        loading,
        addTag,
        updateTag,
        deleteTag
    };
}
