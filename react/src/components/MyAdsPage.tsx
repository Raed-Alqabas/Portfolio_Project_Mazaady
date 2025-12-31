import { useState } from "react";
import { Link } from "react-router";
import { Plus, Edit, Trash2, Eye, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { toast } from "sonner";

export function MyAdsPage() {
  const [ads, setAds] = useState([
    {
      id: 1,
      title: "لكزس ES 2023",
      description: "هايبرد - اقتصادية",
      image: "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=500",
      startBid: 145000,
      currentBid: 148000,
      bidsCount: 12,
      status: "active",
      timeLeft: "3 أيام",
      views: 245,
    },
    {
      id: 2,
      title: "جيب رانجلر 2022",
      description: "معدلة - جاهزة للبر",
      image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500",
      startBid: 165000,
      currentBid: 170000,
      bidsCount: 8,
      status: "active",
      timeLeft: "5 أيام",
      views: 189,
    },
    {
      id: 3,
      title: "هيونداي سوناتا 2024",
      description: "جديدة - لم تستخدم",
      image: "https://images.unsplash.com/photo-1617654112368-307921291f42?w=500",
      startBid: 78000,
      finalBid: 82000,
      bidsCount: 15,
      status: "completed",
      endDate: "منذ يومين",
      views: 312,
    },
  ]);

  const handleDelete = (id: number) => {
    setAds(ads.filter(ad => ad.id !== id));
    toast.success("تم حذف الإعلان بنجاح");
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2">إعلاناتي</h1>
            <p className="text-gray-600">إدارة إعلانات السيارات الخاصة بك</p>
          </div>
          <Link to="/add-car">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة إعلان جديد
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className="group">
              <div className="overflow-hidden rounded-lg">
                {/* Image Container */}
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gray-200">
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                  
                  {/* Status Badge */}
                  {ad.status === "active" ? (
                    <Badge className="absolute top-3 left-3 bg-green-500/90 text-white hover:bg-green-500 border-0 px-3 py-1 text-xs backdrop-blur-sm z-20">
                      نشط
                    </Badge>
                  ) : (
                    <Badge className="absolute top-3 left-3 bg-gray-500/90 text-white hover:bg-gray-500 border-0 px-3 py-1 text-xs backdrop-blur-sm z-20">
                      مكتمل
                    </Badge>
                  )}
                  
                  {/* Views Counter */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm shadow-md rounded-full px-2.5 py-1 flex items-center gap-1 z-20">
                    <Eye className="w-3 h-3 text-gray-700" />
                    <span className="text-xs text-gray-700">{ad.views}</span>
                  </div>
                  
                  {/* Bottom Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between text-white z-10">
                    {ad.status === "active" && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-sm">{ad.timeLeft}</span>
                      </div>
                    )}
                    {ad.status === "completed" && (
                      <div className="text-sm">{ad.endDate}</div>
                    )}
                    <div className="text-left">
                      <div className="text-xs opacity-90">
                        {ad.status === "active" ? "Current Bid" : "Final Bid"}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm">
                          {ad.status === "active" 
                            ? ad.currentBid?.toLocaleString() 
                            : ad.finalBid?.toLocaleString()} ريال
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="bg-white p-3 rounded-b-lg">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-gray-900 text-sm line-clamp-1 flex-1">{ad.title}</h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-1">{ad.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>المزايدات: {ad.bidsCount}</span>
                    <span>البداية: {ad.startBid.toLocaleString()} ريال</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <Link to={`/auction/${ad.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full gap-1 text-xs h-8">
                        <Eye className="w-3 h-3" />
                        عرض
                      </Button>
                    </Link>
                    {ad.status === "active" && (
                      <>
                        <Button variant="outline" size="sm" className="gap-1 text-xs h-8">
                          <Edit className="w-3 h-3" />
                          تعديل
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(ad.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}