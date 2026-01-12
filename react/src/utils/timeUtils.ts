/**
 * Calculate time remaining for an auction
 * @param startDate - Auction start date from backend
 * @param durationMinutes - Duration in MINUTES from backend (note: backend uses minutes, not days!)
 * @returns Formatted time remaining string (e.g., "1 دقيقة", "2 ساعات", "3 أيام")
 */
export function calculateTimeRemaining(startDate: string | null, durationMinutes: number): string {
    if (!startDate) {
        // Fallback: convert minutes to days/hours for display
        const days = Math.floor(durationMinutes / (60 * 24));
        const hours = Math.floor((durationMinutes % (60 * 24)) / 60);
        if (days > 0) {
            return `${days} ${days === 1 ? 'يوم' : 'أيام'}`;
        } else if (hours > 0) {
            return `${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
        } else {
            return `${durationMinutes} ${durationMinutes === 1 ? 'دقيقة' : 'دقائق'}`;
        }
    }

    const start = new Date(startDate);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000); // Convert minutes to milliseconds
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    // If auction has ended
    if (diff <= 0) {
        return "انتهى";
    }

    // Calculate time units
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Return most appropriate unit
    if (days > 0) {
        return `${days} ${days === 1 ? 'يوم' : 'أيام'}`;
    } else if (hours > 0) {
        return `${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
    } else if (minutes > 0) {
        return `${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
    } else {
        return `${seconds} ${seconds === 1 ? 'ثانية' : 'ثواني'}`;
    }
}

/**
 * Calculate time until an auction starts
 * @param startDate - Auction start date from backend
 * @returns Formatted time until start string (e.g., "1 دقيقة", "2 ساعات", "3 أيام")
 */
export function calculateTimeUntilStart(startDate: string | null): string {
    if (!startDate) return "قريباً";

    const start = new Date(startDate);
    const now = new Date();
    const diff = start.getTime() - now.getTime();

    if (diff <= 0) {
        return "بدأ الآن";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
        return `يبدأ خلال ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
    } else if (hours > 0) {
        return `يبدأ خلال ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
    } else {
        return `يبدأ خلال ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
    }
}

/**
 * Check if auction has ended
 */
export function isAuctionEnded(startDate: string | null, durationMinutes: number): boolean {
    if (!startDate) return false;

    const start = new Date(startDate);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    const now = new Date();

    return now.getTime() >= end.getTime();
}

/**
 * Hook to get live updating time remaining
 * Updates every second for accurate countdown
 */
export function useTimeRemaining(startDate: string | null, durationMinutes: number): string {
    const [timeRemaining, setTimeRemaining] = React.useState<string>(
        calculateTimeRemaining(startDate, durationMinutes)
    );

    React.useEffect(() => {
        // Update immediately
        setTimeRemaining(calculateTimeRemaining(startDate, durationMinutes));

        // Then update every second
        const interval = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining(startDate, durationMinutes));
        }, 1000);

        return () => clearInterval(interval);
    }, [startDate, durationMinutes]);

    return timeRemaining;
}

// Need to import React for the hook
import React from "react";
