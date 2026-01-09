import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Gavel, Clock, Trophy, XCircle, CheckCircle, Heart, Star, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import axios from "../api/axios";

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

  useEffect(() => {
    fetchBids();
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
                  <div className="overflow-hidden rounded-lg">
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
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center hover:scale-110 transition-transform z-20"
                      >
                        <Heart className="w-4 h-4 text-gray-700" />
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
                            <span className="text-sm">{bid.currentBid.toLocaleString()} ريال</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="bg-white p-3 rounded-b-lg">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-gray-900 text-sm line-clamp-1 flex-1">{bid.title}</h3>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                          className="flex-shrink-0 mt-0.5"
                        >
                          <Star className="w-4 h-4 text-gray-400 hover:text-yellow-500 hover:fill-yellow-500 transition-colors" />
                        </button>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>مزايدتي: {bid.myBid.toLocaleString()} ريال</p>
                        <p className={bid.status === "winning" ? "text-green-600" : "text-red-600"}>
                          السعر الحالي: {bid.currentBid.toLocaleString()} ريال
                        </p>
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
                  <div className="overflow-hidden rounded-lg">
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
                      
                      {/* Bottom Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between text-white z-10">
                        <div className="text-sm">{bid.endDate}</div>
                        <div className="text-left">
                          <div className="text-xs opacity-90">Final Bid</div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm">{bid.finalBid.toLocaleString()} ريال</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="bg-white p-3 rounded-b-lg">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-gray-900 text-sm line-clamp-1 flex-1">{bid.title}</h3>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                          className="flex-shrink-0 mt-0.5"
                        >
                          <Star className="w-4 h-4 text-gray-400 hover:text-yellow-500 hover:fill-yellow-500 transition-colors" />
                        </button>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>مزايدتي: {bid.myBid.toLocaleString()} ريال</p>
                        <p className={bid.status === "won" ? "text-green-600" : "text-gray-600"}>
                          السعر النهائي: {bid.finalBid.toLocaleString()} ريال
                        </p>
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