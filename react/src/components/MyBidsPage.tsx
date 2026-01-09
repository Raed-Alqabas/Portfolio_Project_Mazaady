import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Gavel, Clock, Trophy, XCircle, CheckCircle, Heart, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import axios from "../api/axios";
import api from "../api/axios";

interface BidData {
  id: number;
  title: string;
  image: string;
  myBid: number;
  currentBid?: number;
  finalBid?: number;
  status: string;
  timeLeft?: string;
  endDate?: string;
  location: string;
}

export function MyBidsPage() {
  const [activeBids, setActiveBids] = useState<BidData[]>([]);
  const [completedBids, setCompletedBids] = useState<BidData[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchBids();
    fetchUserFavorites();

    // Listen for favorites changes
    const handleFavoritesChange = () => {
      const stored = localStorage.getItem('favorites');
      if (stored) {
        setFavorites(new Set<number>(JSON.parse(stored)));
      }
    };

    window.addEventListener('favoritesChanged', handleFavoritesChange);
    return () => window.removeEventListener('favoritesChanged', handleFavoritesChange);
  }, []);

  const fetchBids = async () => {
    try {
      const response = await axios.get('/my-bids/');
      setActiveBids(response.data.active || []);
      setCompletedBids(response.data.completed || []);
    } catch (error) {
      console.error('Error fetching bids:', error);
      toast.error('فشل تحميل المزايدات');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFavorites = async () => {
    try {
      const response = await api.get("/favorites/");
      const favoriteIds = new Set<number>(response.data.map((fav: any) => fav.car.id));
      setFavorites(favoriteIds);
      localStorage.setItem('favorites', JSON.stringify(Array.from(favoriteIds)));
    } catch (error) {
      const stored = localStorage.getItem('favorites');
      if (stored) {
        setFavorites(new Set<number>(JSON.parse(stored)));
      }
    }
  };

  const toggleFavorite = async (carId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isFavorited = favorites.has(carId);

    try {
      if (isFavorited) {
        await api.delete(`/favorites/${carId}/remove/`);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(carId);
          localStorage.setItem('favorites', JSON.stringify(Array.from(newSet)));
          window.dispatchEvent(new Event('favoritesChanged'));
          return newSet;
        });
        toast.success("تمت إزالة السيارة من المفضلة");
      } else {
        await api.post(`/favorites/${carId}/add/`);
        setFavorites(prev => {
          const newSet = new Set(prev).add(carId);
          localStorage.setItem('favorites', JSON.stringify(Array.from(newSet)));
          window.dispatchEvent(new Event('favoritesChanged'));
          return newSet;
        });
        toast.success("تمت إضافة السيارة للمفضلة");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("يرجى تسجيل الدخول لإضافة المفضلة");
      } else {
        toast.error("حدث خطأ، حاول مرة أخرى");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="mb-2">مزايداتي</h1>
          <p className="text-gray-600">تتبع جميع مزايداتك النشطة والمكتملة</p>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active" className="gap-2">
              <Gavel className="w-4 h-4" />
              المزايدات النشطة ({activeBids.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <Trophy className="w-4 h-4" />
              المزايدات المكتملة ({completedBids.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeBids.map((bid) => (
                <Link to={`/auction/${bid.id}`} key={bid.id} className="block group">
                  <div className="overflow-hidden rounded-lg border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    {/* Image Container */}
                    <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gray-200">
                      <img
                        src={bid.image}
                        alt={bid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Dark Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                      
                      {/* Status Badge */}
                      {bid.status === "winning" ? (
                        <Badge className="absolute top-3 left-3 bg-green-500/90 text-white hover:bg-green-500 border-0 px-3 py-1 text-xs backdrop-blur-sm z-20 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          أنت الأعلى
                        </Badge>
                      ) : (
                        <Badge className="absolute top-3 left-3 bg-red-500/90 text-white hover:bg-red-500 border-0 px-3 py-1 text-xs backdrop-blur-sm z-20 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          تم تجاوزك
                        </Badge>
                      )}
                      
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(bid.id, e)}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center hover:scale-110 transition-transform z-20"
                      >
                        <Heart className={`w-4 h-4 ${favorites.has(bid.id) ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                      </button>
                      
                      {/* Bottom Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between text-white z-10">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-sm">{bid.timeLeft}</span>
                        </div>
                        <div className="text-left">
                          <div className="text-xs opacity-90">Bid</div>
                          <div className="flex items-baseline gap-1">
                          <span className="font-medium">{(bid.currentBid || 0).toLocaleString()} ريال</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="bg-white p-3 rounded-b-lg">
                      <h3 className="text-gray-900 text-sm font-semibold mb-2 line-clamp-1 text-right">{bid.title}</h3>
                      <div className="space-y-1 text-xs text-gray-600 text-right">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{bid.myBid.toLocaleString()} ريال</span>
                          <span>مزايدتي:</span>
                        </div>
                        <div className={`flex items-center justify-between gap-2 ${bid.status === "winning" ? "text-green-600" : "text-red-600"}`}>
                          <span className="font-medium">{(bid.currentBid || 0).toLocaleString()} ريال</span>
                          <span>السعر الحالي:</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedBids.map((bid) => (
                <Link to={`/auction/${bid.id}`} key={bid.id} className="block group">
                  <div className="overflow-hidden rounded-lg border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    {/* Image Container */}
                    <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gray-200">
                      <img
                        src={bid.image}
                        alt={bid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Dark Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                      
                      {/* Status Badge */}
                      {bid.status === "won" ? (
                        <Badge className="absolute top-3 left-3 bg-green-500/90 text-white hover:bg-green-500 border-0 px-3 py-1 text-xs backdrop-blur-sm z-20 flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          فائز
                        </Badge>
                      ) : (
                        <Badge className="absolute top-3 left-3 bg-gray-500/90 text-white hover:bg-gray-500 border-0 px-3 py-1 text-xs backdrop-blur-sm z-20">
                          انتهى
                        </Badge>
                      )}
                      
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(bid.id, e)}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center hover:scale-110 transition-transform z-20"
                      >
                        <Heart className={`w-4 h-4 ${favorites.has(bid.id) ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                      </button>
                      
                      {/* Bottom Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between text-white z-10">
                        <div className="text-sm">{bid.endDate}</div>
                        <div className="text-left">
                          <div className="text-xs opacity-90">Final Bid</div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm">{(bid.finalBid || 0).toLocaleString()} ريال</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="bg-white p-3 rounded-b-lg">
                      <h3 className="text-gray-900 text-sm font-semibold mb-2 line-clamp-1 text-right">{bid.title}</h3>
                      <div className="space-y-1 text-xs text-gray-600 text-right">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{bid.myBid.toLocaleString()} ريال</span>
                          <span>مزايدتي:</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-gray-800">
                          <span className="font-medium">{(bid.finalBid || 0).toLocaleString()} ريال</span>
                          <span>السعر النهائي:</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}