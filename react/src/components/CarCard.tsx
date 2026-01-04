import { Heart, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

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
  timeLeft: string;
  image: string;
  featured?: boolean;
  highBid?: boolean;
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
  timeLeft,
  image,
  featured = false,
  highBid = false
}: CarCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Link to={`/auction/${id}`} className="block group">
      <div className="overflow-hidden rounded-lg">
        {/* Image Container - No white frame */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg bg-gray-200">
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Dark Gradient Overlay at Bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
          
          {/* Featured Badge - Top Left */}
          {featured && (
            <div className="absolute top-3 left-3 z-20">
              <Badge className="bg-gray-900/90 text-white hover:bg-gray-900 border-0 px-3 py-1 text-xs backdrop-blur-sm">
                FEATURED
              </Badge>
            </div>
          )}
          
          {/* High Bid Badge - Top Left */}
          {highBid && (
            <div className="absolute top-3 left-3 z-20">
              <Badge className="bg-[#1e3a8a]/90 text-white hover:bg-[#1e3a8a] border-0 px-3 py-1 text-xs backdrop-blur-sm">
                High Bid
              </Badge>
            </div>
          )}
          
          {/* Favorite Button - Top Right */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center hover:scale-110 transition-transform z-20"
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} 
            />
          </button>
          
          {/* Bottom Info Overlay - On Image */}
          <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between text-white z-10">
            {/* Time Left */}
            <div className="flex items-center gap-1">
              <span className="text-xs">⏱</span>
              <span className="text-sm">{timeLeft}</span>
            </div>
            {/* Current Bid */}
            <div className="text-left">
              <div className="text-xs opacity-90">Bid</div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm">${currentBid.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content - White Background */}
        <div className="bg-white p-3 rounded-b-lg">
          {/* Title with Star */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-gray-900 text-sm line-clamp-2 flex-1">
              {title}
            </h3>
            <button
              onClick={(e) => {
                e.preventDefault();
              }}
              className="flex-shrink-0 mt-0.5"
            >
              <Star className="w-4 h-4 text-gray-400 hover:text-yellow-500 hover:fill-yellow-500 transition-colors" />
            </button>
          </div>
          
          {/* Car Details */}
          <div className="space-y-1 text-xs text-gray-600">
            <p className="line-clamp-1">
              {transmission}، {fuel}، {mileage.toLocaleString()} كم
            </p>
            <p>
              {year} · {model}
            </p>
          </div>
          
          {/* Location */}
          <div className="flex items-start gap-1 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
            <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}