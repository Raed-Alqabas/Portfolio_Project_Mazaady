import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Clock, Users, Gavel, Filter, Heart, Car as CarIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import api from "../api/axios";

export function AuctionsPage() {
  const [filter, setFilter] = useState("all");
  const [activeCars, setActiveCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveCars();
  }, []);

  const fetchActiveCars = async () => {
    try {
      const response = await api.get("/cars/public/");
      setActiveCars(response.data);
    } catch (error) {
      console.error("Error fetching active cars:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAuctions = filter === "all"
    ? activeCars
    : activeCars.filter(a => a.status === filter); // Though they are all ACTIVE from public endpoint

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
                  <SelectItem value="ACTIVE">نشطة</SelectItem>
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
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredAuctions.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border shadow-sm">
              <CarIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد مزادات نشطة حالياً</p>
            </div>
          ) : (
            filteredAuctions.map((auction) => (
              <Card key={auction.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Link to={`/auction/${auction.id}`}>
                  {/* Image Container */}
                  <div className="relative aspect-video overflow-hidden bg-gray-200">
                    {auction.images?.[0]?.image ? (
                      <img
                        src={auction.images[0].image}
                        alt={auction.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CarIcon className="w-10 h-10 text-gray-300" />
                      </div>
                    )}

                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                    {/* Status Badge */}
                    <Badge className="absolute top-3 left-3 bg-green-500/90 text-white hover:bg-green-500 border-0 px-3 py-1 text-xs backdrop-blur-sm z-20">
                      نشط
                    </Badge>

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
                          <span className="text-sm">{auction.auction_duration} أيام</span>
                        </div>
                        <div className="text-left">
                          <div className="text-xs opacity-90">المزايدة الحالية</div>
                          <div className="font-bold">
                            {Number(auction.current_bid).toLocaleString()} ريال
                          </div>
                        </div>
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
                        <span>{auction.bids_count} مزايدة</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {auction.brand}
                      </Badge>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}