
import { Heart, MapPin, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import confetti from "canvas-confetti";
import { toggleFavorite } from "../api/favorites";
import { toast } from "sonner";

interface CarCardProps {
  id: number;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel: string;
  transmission: string;
  location: string;
  currentBid: number;
  timeLeft?: string;
  endTime?: string;
  image: string;
  featured?: boolean;
  highBid?: boolean;
  isFavorited?: boolean;
}

export function CarCard({ 
  id, 
  title, 
  brand,
  model,
  year, 
  mileage, 
  fuel,
  transmission,
  location, 
  currentBid, 
  timeLeft: initialTimeLeft,
  endTime,
  image,
  featured = false,
  highBid = false,
  isFavorited = false
}: CarCardProps) {
  const [favorite, setFavorite] = useState(isFavorited);
  const [displayTime, setDisplayTime] = useState(initialTimeLeft || "");

  useEffect(() => {
    if (!endTime) return;

    const timer = setInterval(() => {
      const end = new Date(endTime).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setDisplayTime("منتهي");
        clearInterval(timer);
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (d > 0) {
          setDisplayTime(`${d} أيام و ${h} ساعات`);
        } else {
          setDisplayTime(`${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newStatus = !favorite;
    setFavorite(newStatus);
    
    if (newStatus) {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { x, y },
        colors: ['#f97316', '#fb923c', '#ffedd5'],
        scalar: 0.6,
      });
    }

    try {
      await toggleFavorite(id);
    } catch (error) {
      setFavorite(!newStatus);
      toast.error("حدث خطأ في تحديث المفضلة");
    }
  };

  return (
    <Link to={`/auction/${id}`} className="block group">
      <div className="overflow-hidden rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Dark Gradient Overlay at Bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
          
          {/* Favorite Button - Top Right */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform z-20 ${
                favorite ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${favorite ? 'fill-current' : ''}`} 
            />
          </button>
          
          {/* Bottom Info Overlay - On Image */}
          <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between text-white z-10">
            {/* Time Left */}
            <div className="flex items-center gap-1 font-bold">
              <Clock className="w-3 h-3" />
              <span className="text-[10px]">{displayTime}</span>
            </div>
            {/* Current Bid */}
            <div className="text-left">
              <div className="text-[10px] opacity-90 font-bold">Bid</div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-bold">{currentBid.toLocaleString()} ريال</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content - White Background */}
        <div className="p-3 text-right">
          {/* Title */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-gray-900 text-xs line-clamp-2 flex-1 font-bold">
              {title}
            </h3>
          </div>
          
          {/* Car Details */}
          <div className="space-y-1 text-[10px] text-gray-600 font-bold">
            <p className="line-clamp-1">
              {transmission}، {fuel}، {mileage.toLocaleString()} كم
            </p>
            <p>
              {year} · {brand} - {model}
            </p>
          </div>
          
          {/* Location */}
          <div className="flex items-start justify-end gap-1 text-[10px] text-gray-500 mt-2 pt-2 border-t border-gray-100 font-bold">
            <span className="line-clamp-1">{location}</span>
            <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-primary" />
          </div>
        </div>
      </div>
    </Link>
  );
}