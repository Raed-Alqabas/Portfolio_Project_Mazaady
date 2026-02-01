import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Clock, Users, Gavel, Filter, Heart, Car as CarIcon, Search } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import api from "../api/axios";
import { toast } from "sonner";
import { calculateTimeRemaining, isAuctionEnded, calculateTimeUntilStart } from "../utils/timeUtils";

// Helper function to format auction duration (minutes) to readable text
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} دقيقة`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
  } else {
    const days = Math.floor(minutes / 1440);
    return `${days} ${days === 1 ? 'يوم' : days === 2 ? 'يومين' : 'أيام'}`;
  }
};

export function AuctionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const urlType = searchParams.get("type") || "all";
  const urlRegion = searchParams.get("region") || "all";

  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [activeCars, setActiveCars] = useState<any[]>([]);
  const [soonCars, setSoonCars] = useState<any[]>([]);
  const [closedCars, setClosedCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    fetchCars(urlSearch, urlType, urlRegion);
  }, [urlSearch, urlType, urlRegion]);

  // Update time every second for live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchCars = async (search = "", type = "all", region = "all") => {
    try {
      setIsLoading(true);
      const response = await api.get(`/cars/public/?status=all&search=${search}&type=${type}&region=${region}`);
      const allCars = response.data;
      setActiveCars(allCars.filter((c: any) => c.status === 'ACTIVE'));
      setSoonCars(allCars.filter((c: any) => c.status === 'SOON'));
      setClosedCars(allCars.filter((c: any) => c.status === 'CLOSED'));
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCars(searchTerm);
  };

  const filteredAuctions = filter === "all"
    ? [...activeCars, ...soonCars]
    : filter === "CLOSED"
      ? closedCars
      : filter === "SOON"
        ? soonCars
        : activeCars.filter(a => a.status === filter);

  return (
    <div className="min-h-screen bg-background py-4 md:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Gavel className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl text-gray-900 truncate">المزادات</h1>
              <p className="text-gray-600 text-xs sm:text-sm line-clamp-1">تصفح جميع المزادات المتاحة وشارك في المزايدة</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-4 md:mb-6 border-0 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 md:gap-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex items-center gap-2 w-full">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="ابحث عن سيارة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-9 bg-gray-50 border-gray-200 h-9 sm:h-10 text-sm"
                  />
                </div>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 h-9 sm:h-10 px-3 sm:px-4 text-sm whitespace-nowrap">
                  بحث
                </Button>
              </form>

              {/* Divider - hidden on mobile */}
              <div className="h-px bg-gray-200 md:hidden" />

              {/* Filter Section */}
              <div className="flex items-center gap-2 sm:gap-4 w-full">
                <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  <span className="text-sm sm:text-base text-gray-700">تصفية:</span>
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="flex-1 sm:flex-initial sm:w-48 bg-gray-50 border-gray-200 h-9 sm:h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المزادات النشطة</SelectItem>
                    <SelectItem value="ACTIVE">نشطة فقط</SelectItem>
                    <SelectItem value="SOON">تبدأ قريباً</SelectItem>
                    <SelectItem value="CLOSED">منتهية فقط</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm px-2 py-1">
                  {filteredAuctions.length} مزاد
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auctions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredAuctions.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border shadow-sm">
              <CarIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-500">لا توجد مزادات نشطة حالياً</p>
            </div>
          ) : (
            filteredAuctions.map((auction) => (
              <Card key={auction.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Link to={`/auction/${auction.id}`}>
                  {/* Image Container - Fixed aspect ratio */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-200">
                    {auction.images?.[0]?.image ? (
                      <img
                        src={auction.images[0].image}
                        alt={auction.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                        <CarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
                      </div>
                    )}

                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                    {/* Status Badge */}
                    <Badge className={`absolute top-2 sm:top-3 left-2 sm:left-3 border-0 px-2 sm:px-3 py-0.5 sm:py-1 text-xs backdrop-blur-sm z-20 ${
                      auction.status === 'SOON' ? 'bg-blue-500 text-white' : 'bg-green-500/90 text-white'
                    }`}>
                      {auction.status === 'SOON' ? 'قريباً' : 'نشط'}
                    </Badge>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      className="absolute top-2 sm:top-3 right-2 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center hover:scale-110 hover:bg-red-50 transition-all z-20 group/fav"
                    >
                      <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 group-hover/fav:text-red-500 group-hover/fav:fill-red-500 transition-colors" />
                    </button>

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 md:p-4 text-white z-10">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm truncate">
                            {auction.status === 'SOON'
                              ? calculateTimeUntilStart(auction.start_date)
                              : calculateTimeRemaining(auction.start_date, auction.auction_duration)}
                          </span>
                        </div>
                        <div className="text-left flex-shrink-0">
                          <div className="text-xs opacity-90 whitespace-nowrap">
                            {auction.status === 'SOON' ? 'سعر البداية' : 'المزايدة الحالية'}
                          </div>
                          <div className="font-bold text-sm sm:text-base whitespace-nowrap">
                            {Number(auction.current_bid).toLocaleString()} ريال
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base text-gray-900 mb-1.5 sm:mb-2 line-clamp-1 font-semibold">
                      {auction.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-1">{auction.description}</p>

                    <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
                      <div className="flex items-center gap-1 text-gray-500 min-w-0">
                        {auction.status === 'SOON' ? (
                          <span className="text-blue-500 font-medium text-xs sm:text-sm truncate">لم تبدأ بعد</span>
                        ) : (
                          <>
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{auction.bids_count} مزايدة</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        {auction.status === 'SOON' && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200 px-1.5 py-0.5">
                            عرض فقط
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          {auction.brand}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))
          )}
        </div>

        {/* Closed Auctions Section */}
        {filter === "all" && closedCars.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              المزادات المنتهية
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 opacity-85">
              {closedCars.map((auction) => (
                <Card key={auction.id} className="group overflow-hidden border-0 shadow-md grayscale hover:grayscale-0 transition-all duration-300">
                  <Link to={`/auction/${auction.id}`}>
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-200">
                      {auction.images?.[0]?.image ? (
                        <img
                          src={auction.images[0].image}
                          alt={auction.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                          <CarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Badge variant="secondary" className="bg-white/90 text-gray-900 scale-110 text-xs sm:text-sm px-2 sm:px-3 py-1">
                          منتهي
                        </Badge>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 text-white z-10 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="flex justify-between items-end gap-2">
                          <span className="text-xs truncate">{auction.brand}</span>
                          <span className="font-bold text-xs sm:text-sm whitespace-nowrap">{Number(auction.current_bid).toLocaleString()} ريال</span>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-3 sm:p-4 bg-gray-50/50">
                      <h3 className="text-sm sm:text-base text-gray-700 font-semibold line-clamp-1">{auction.title}</h3>
                      <div className="flex justify-between mt-1.5 sm:mt-2 text-xs text-gray-500">
                        <span className="truncate">{auction.location}</span>
                        <span className="flex-shrink-0">{auction.year}</span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}