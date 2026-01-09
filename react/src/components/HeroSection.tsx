import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Gavel, Heart, Clock, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useFavorite } from "../hooks/useFavorite";
import { Car } from "../api/cars";

interface HeroSectionProps {
  auctions: Car[];
}

export function HeroSection({ auctions }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Safety check if no auctions provided
  if (!auctions || auctions.length === 0) {
      return null;
  }

  // Ensure currentSlide is valid
  const safeCurrentSlide = currentSlide % auctions.length;
  const currentAuction = auctions[safeCurrentSlide];

  const { favorite, handleFavoriteClick } = useFavorite(currentAuction.is_favorited, currentAuction.id);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % auctions.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [auctions.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % auctions.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + auctions.length) % auctions.length);
  };

  // Helper to ensure absolute URL for images
  const getAbsoluteImageUrl = (url: string) => {
    if (!url) return "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1200"; // Default fallback
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    
    const baseUrl = (import.meta as any).env.VITE_API_URL.replace('/api', '');
    return `${baseUrl}${url}`;
  };
  
  const imageUrl = getAbsoluteImageUrl(currentAuction.image);

  return (
    <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={currentAuction.title}
          className="w-full h-full object-cover opacity-20 transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-transparent shadow-inner"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-6">
              <div className="flex justify-start">
                <Badge className="bg-accent/20 text-accent border-accent/30 backdrop-blur-sm text-sm py-2 px-4 animate-bounce">
                  🏆 مزاد مميز
                </Badge>
              </div>

              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
                  {currentAuction.title}
                </h1>
                <p className="text-xl text-blue-100 mb-6 line-clamp-2">
                  {currentAuction.description || `${currentAuction.year} - ${currentAuction.mileage.toLocaleString()} كم`}
                </p>
              </div>

              {/* Auction Info */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-blue-200 mb-1 font-medium">المزايدة الحالية</div>
                    <div className="text-3xl font-extrabold text-white">
                      {Number(currentAuction.latest_bid || currentAuction.start_bid).toLocaleString()} ريال
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-200 mb-1 font-medium">الوقت المتبقي</div>
                    <div className="flex items-center gap-2 text-2xl font-bold text-accent">
                      <Clock className="w-6 h-6" />
                      {currentAuction.timeLeft}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/20">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <span>{currentAuction.bids_count || 0} مزايدة نشطة</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    نشط الآن
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link to={`/auction/${currentAuction.id}`} className="flex-1">
                    <Button 
                      size="lg" 
                      className="w-full bg-accent hover:bg-accent/90 text-white h-14 rounded-xl shadow-lg shadow-accent/20 font-bold transition-all hover:scale-[1.02]"
                    >
                      <Gavel className="w-5 h-5 ml-2" />
                      ابدأ المزايدة
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleFavoriteClick}
                    className={`h-14 px-6 border-white/30 rounded-xl transition-all ${
                       favorite ? 'bg-white text-accent hover:bg-white/90' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Navigation Dots - Centered Mobile, Left Desktop */}
              <div className="flex items-center gap-3 justify-center md:justify-start">
                {auctions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === safeCurrentSlide
                        ? "w-12 bg-accent shadow-[0_0_10px_rgba(255,107,0,0.5)]"
                        : "w-2 bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right Side - Featured Car Image */}
            <div className="relative hidden md:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 aspect-video">
                <img
                  src={imageUrl}
                  alt={currentAuction.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                
                {/* Image Overlay Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-white/90 text-primary border-0">
                      {currentAuction.bids_count || 0} مزايدة
                    </Badge>
                    <button 
                       onClick={handleFavoriteClick}
                       className={`p-3 rounded-full hover:scale-110 transition-transform ${
                           favorite ? 'bg-white text-red-500' : 'bg-white/90 text-gray-700'
                       }`}
                    >
                      <Heart className={`w-5 h-5 ${favorite ? 'fill-red-500' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Arrow Navigation */}
              <button
                onClick={prevSlide}
                className="absolute top-1/2 -left-4 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-20"
              >
                <ChevronRight className="w-6 h-6 text-primary" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-20"
              >
                <ChevronLeft className="w-6 h-6 text-primary" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
    </section>
  );
}
