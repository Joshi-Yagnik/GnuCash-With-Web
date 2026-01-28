import { useState, ReactNode } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: ReactNode;
    threshold?: number;
}

export function PullToRefresh({
    onRefresh,
    children,
    threshold = 80,
}: PullToRefreshProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const y = useMotionValue(0);
    const rotate = useTransform(y, [0, threshold], [0, 360]);
    const opacity = useTransform(y, [0, threshold], [0, 1]);

    async function handleDragEnd(event: any, info: PanInfo) {
        if (info.offset.y > threshold && !isRefreshing) {
            setIsRefreshing(true);
            await onRefresh();
            setIsRefreshing(false);
        }
        y.set(0);
    }

    return (
        <div className="relative overflow-hidden">
            {/* Refresh indicator */}
            <motion.div
                className="absolute top-0 left-0 right-0 flex justify-center pt-4 pointer-events-none z-10"
                style={{ opacity }}
            >
                <motion.div
                    style={{ rotate }}
                    className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
                >
                    <svg
                        className={`w-5 h-5 text-primary ${isRefreshing ? "animate-spin" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                </motion.div>
            </motion.div>

            {/* Content */}
            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.3, bottom: 0 }}
                style={{ y }}
                onDragEnd={handleDragEnd}
                className="touch-pan-y"
            >
                {children}
            </motion.div>
        </div>
    );
}
