
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { toggleFavorite } from "../api/favorites";

export function useFavorite(initialState: boolean, carId: number) {
  const [favorite, setFavorite] = useState(initialState);

  // Sync state when prop changes (e.g. carousel slide change)
  useEffect(() => {
    setFavorite(initialState);
  }, [initialState, carId]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    const newStatus = !favorite;
    setFavorite(newStatus);

    if (newStatus) {
      // Confetti effect at click position
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { x, y },
        colors: ['#ef4444', '#ec4899', '#e11d48'],
        scalar: 0.6,
        disableForReducedMotion: true
      });
    }

    try {
      const response = await toggleFavorite(carId);
      if (newStatus) {
        toast.success(response.message || "Updated favorite");
      } else {
        toast.info(response.message || "Removed from favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setFavorite(!newStatus); // Revert
      toast.error("حدث خطأ في تحديث المفضلة");
    }
  };

  return { favorite, handleFavoriteClick };
}
