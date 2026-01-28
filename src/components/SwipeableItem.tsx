import { ReactNode } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";

interface SwipeableItemProps {
    children: ReactNode;
    onEdit?: () => void;
    onDelete?: () => void;
    editLabel?: string;
    deleteLabel?: string;
    threshold?: number;
}

export function SwipeableItem({
    children,
    onEdit,
    onDelete,
    editLabel = "Edit",
    deleteLabel = "Delete",
    threshold = 100,
}: SwipeableItemProps) {
    const x = useMotionValue(0);

    const editBackground = useTransform(
        x,
        [0, threshold],
        ["rgba(59, 130, 246, 0)", "rgba(59, 130, 246, 1)"]
    );

    const deleteBackground = useTransform(
        x,
        [-threshold, 0],
        ["rgba(239, 68, 68, 1)", "rgba(239, 68, 68, 0)"]
    );

    function handleDragEnd(event: any, info: PanInfo) {
        if (info.offset.x < -threshold && onDelete) {
            // Swiped left - delete
            onDelete();
            x.set(0);
        } else if (info.offset.x > threshold && onEdit) {
            // Swiped right - edit
            onEdit();
            x.set(0);
        } else {
            // Snap back
            x.set(0);
        }
    }

    return (
        <div className="relative overflow-hidden rounded-lg md:overflow-visible">
            {/* Edit action (right side) */}
            {onEdit && (
                <motion.div
                    className="absolute inset-y-0 left-0 flex items-center justify-start px-6 text-white"
                    style={{ background: editBackground }}
                >
                    <div className="flex items-center gap-2">
                        <Edit2 className="w-5 h-5" />
                        <span className="font-medium">{editLabel}</span>
                    </div>
                </motion.div>
            )}

            {/* Delete action (left side) */}
            {onDelete && (
                <motion.div
                    className="absolute inset-y-0 right-0 flex items-center justify-end px-6 text-white"
                    style={{ background: deleteBackground }}
                >
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{deleteLabel}</span>
                        <Trash2 className="w-5 h-5" />
                    </div>
                </motion.div>
            )}

            {/* Draggable content */}
            <motion.div
                drag="x"
                dragConstraints={{ left: onDelete ? -threshold * 2 : 0, right: onEdit ? threshold * 2 : 0 }}
                dragElastic={0.2}
                style={{ x }}
                onDragEnd={handleDragEnd}
                className="bg-card relative z-10 touch-pan-y"
            >
                {children}
            </motion.div>
        </div>
    );
}
