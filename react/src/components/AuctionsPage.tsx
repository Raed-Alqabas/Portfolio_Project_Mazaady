import { useState } from "react";
import { Link } from "react-router";
import { Clock, Users, Gavel, Filter, Heart, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export function AuctionsPage() {
  const [filter, setFilter] = useState("all");

  const auctions = [
    {
      id: 1,
      title: "تويوتا كامري 2023",
      description: "حالة ممتازة - فحص شامل",
      currentBid: 85000,
      startBid: 75000,
      endTime: "3 ساعات",
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500",
      bids: 24,
      category: "سيدان",
      status: "active",
    },
    {
      id: 2,
      title: "مرسيدس E-Class 2022",
      description: "كامل المواصفات - صيانة وكالة",
      currentBid: 180000,
      startBid: 160000,
      endTime: "5 ساعات",
      image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=500",
      bids: 31,
      category: "سيدان",
      status: "active",
    },
    {
      id: 3,
      title: "هوندا أكورد 2024",
      description: "جديدة - لم تستخدم",
      currentBid: 95000,
      startBid: 90000,
      endTime: "2 ساعات",
      image: "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=500",
      bids: 18,
      category: "سيدان",
      status: "active",
    },
    {
      id: 4,
      title: "BMW X5 2023",
      description: "فل كامل - بحالة الوكالة",
      currentBid: 220000,
      startBid: 200000,
      endTime: "4 ساعات",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500",
      bids: 42,
      category: "دفع رباعي",
      status: "active",
    },
    {
      id: 5,
      title: "لكزس ES 2023",
      description: "هايبرد - اقتصادية",
      currentBid: 145000,
      startBid: 135000,
      endTime: "6 ساعات",
      image: "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=500",
      bids: 27,
      category: "سيدان",
      status: "active",
    },
    {
      id: 6,
      title: "جيب رانجلر 2022",
      description: "معدلة - جاهزة للبر",
      currentBid: 165000,
      startBid: 150000,
      endTime: "1 ساعة",
      image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500",
      bids: 35,
      category: "دفع رباعي",
      status: "ending",
    },
    {
      id: 7,
      title: "أودي A6 2024",
      description: "قريباً - قيد المراجعة",
      currentBid: 0,
      startBid: 200000,
      endTime: "يبدأ خلال 2 أيام",
      image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500",
      bids: 0,
      category: "سيدان",
      status: "upcoming",
    },
    {
      id: 8,
      title: "تويوتا لاند كروزر 2023",
      description: "قريباً - قيد المراجعة",
      currentBid: 0,
      startBid: 280000,
      endTime: "يبدأ خلال 3 أيام",
      image: "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=500",
      bids: 0,
      category: "دفع رباعي",
      status: "upcoming",
    },
  ];

  const filteredAuctions = filter === "all" 
    ? auctions 
    : auctions.filter(a => a.status === filter);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <Gavel className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">المزادات النشطة</h1>
              <p className="text-gray-600 text-sm">تصفح جميع المزادات المتاحة وشارك في المزايدة</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">تصفية حسب:</span>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48 bg-gray-50 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المزادات</SelectItem>
                  <SelectItem value="active">نشطة</SelectItem>
                  <SelectItem value="ending">تنتهي قريباً</SelectItem>
                  <SelectItem value="upcoming">قريباً تعرض</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="secondary" className="mr-auto bg-primary/10 text-primary border-primary/20">
                {filteredAuctions.length} مزاد
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Auctions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => (
            <Card key={auction.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <Link to={`/auction/${auction.id}`}>
                {/* Image Container */}
                <div className="relative aspect-video overflow-hidden bg-gray-200">
                  <img
                    src={auction.image}
                    alt={auction.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                  
                  {/* Status Badge */}
                  {auction.status === 'upcoming' ? (
                    <Badge className="absolute top-3 left-3 bg-amber-500/90 text-white hover:bg-amber-500 border-0 px-3 py-1 text-xs backdrop-blur-sm z-20">
                      قريباً
                    </Badge>
                  ) : auction.status === 'ending' ? (
                    <Badge className="absolute top-3 left-3 bg-red-500/90 text-white hover:bg-red-500 border-0 px-3 py-1 text-xs backdrop-blur-sm z-20">
                      ينتهي قريباً
                    </Badge>
                  ) : (
                    <Badge className="absolute top-3 left-3 bg-green-500/90 text-white hover:bg-green-500 border-0 px-3 py-1 text-xs backdrop-blur-sm z-20">
                      نشط
                    </Badge>
                  )}
                  
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center hover:scale-110 hover:bg-red-50 transition-all z-20 group/fav"
                  >
                    <Heart className="w-4 h-4 text-gray-700 group-hover/fav:text-red-500 group-hover/fav:fill-red-500 transition-colors" />
                  </button>
                  
                  {/* Bottom Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{auction.endTime}</span>
                      </div>
                      {auction.status !== 'upcoming' && (
                        <div className="text-left">
                          <div className="text-xs opacity-90">المزايدة الحالية</div>
                          <div className="font-bold">
                            {auction.currentBid.toLocaleString()} ريال
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <CardContent className="p-4">
                  <h3 className="text-gray-900 mb-2 line-clamp-1">
                    {auction.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-1">{auction.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{auction.bids} مزايدة</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {auction.category}
                    </Badge>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}