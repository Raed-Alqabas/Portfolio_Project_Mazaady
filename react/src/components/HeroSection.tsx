import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Gavel, Heart, Clock, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface FeaturedAuction {
  id: number;
  title: string;
  description: string;
  currentBid: number;
  timeLeft: string;
  image: string;
  bids: number;
}

const featuredAuctions: FeaturedAuction[] = [
  {
    id: 1,
    title: "مرسيدس بنز S-Class 2024",
    description: "فل كامل - بحالة الوكالة - صيانة دورية",
    currentBid: 450000,
    timeLeft: "2:45:30",
    image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1200",
    bids: 47,
  },
  {
    id: 2,
    title: "BMW M5 Competition 2023",
    description: "رياضية - محرك V8 - أداء استثنائي",
    currentBid: 380000,
    timeLeft: "4:20:15",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200",
    bids: 38,
  },
  {
    id: 3,
    title: "بورش كايين توربو 2024",
    description: "فاخرة - دفع رباعي - تقنيات حديثة",
    currentBid: 520000,
    timeLeft: "1:35:45",
    image: "https://images.unsplash.com/photo-1691884454273-25705ae205b9?w=1200",
    bids: 52,
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredAuctions.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredAuctions.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredAuctions.length) % featuredAuctions.length);
  };

  const currentAuction = featuredAuctions[currentSlide];

  return (
    <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentAuction.image}
          alt={currentAuction.title}
          className="w-full h-full object-cover opacity-20 transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-6">
              <Badge className="bg-accent/20 text-accent border-accent/30 backdrop-blur-sm text-sm py-2 px-4">
                🏆 مزاد مميز
              </Badge>

              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">
                  {currentAuction.title}
                </h1>
                <p className="text-xl text-blue-100 mb-6">
                  {currentAuction.description}
                </p>
              </div>

              {/* Auction Info */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-blue-200 mb-1">المزايدة الحالية</div>
                    <div className="text-3xl font-bold">
                      {currentAuction.currentBid.toLocaleString()} ريال
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-200 mb-1">الوقت المتبقي</div>
                    <div className="flex items-center gap-2 text-2xl font-bold">
                      <Clock className="w-6 h-6" />
                      {currentAuction.timeLeft}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/20">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    <span>{currentAuction.bids} مزايدة نشطة</span>
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
                      className="w-full bg-accent hover:bg-accent/90 text-white h-14 rounded-xl shadow-lg shadow-accent/20"
                    >
                      <Gavel className="w-5 h-5 ml-2" />
                      ابدأ المزايدة
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-6 border-white/30 text-white hover:bg-white/10 rounded-xl"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Navigation Dots */}
              <div className="flex items-center gap-3">
                {featuredAuctions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? "w-12 bg-accent"
                        : "w-2 bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right Side - Featured Car Image */}
            <div className="relative hidden md:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
                <img
                  src={currentAuction.image}
                  alt={currentAuction.title}
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                
                {/* Image Overlay Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-white/90 text-primary border-0">
                      {currentAuction.bids} مزايدة
                    </Badge>
                    <button className="p-3 bg-white/90 rounded-full hover:scale-110 transition-transform">
                      <Heart className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Arrow Navigation */}
              <button
                onClick={prevSlide}
                className="absolute top-1/2 -left-4 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              >
                <ChevronRight className="w-6 h-6 text-primary" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
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
