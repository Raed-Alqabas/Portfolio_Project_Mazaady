import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Car as CarIcon, Fuel, Gauge, Calendar, MapPin, Filter, Search, Loader2, Clock, Heart, Users } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CarCard } from "./CarCard";
import api from "../api/axios";
import { calculateTimeRemaining, calculateTimeUntilStart } from "../utils/timeUtils";

export function CarsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCars, setActiveCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    fetchActiveCars();
  }, []);

  // Update time every second for live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchActiveCars = async (search = "") => {
    try {
      setIsLoading(true);
      const response = await api.get(`/cars/public/?status=all&search=${search}`);
      const allCars = response.data;
      const relevantCars = allCars.filter((car: any) => car.status === 'ACTIVE' || car.status === 'SOON');
      setActiveCars(relevantCars);
    } catch (error) {
      console.error("Error fetching active cars:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchActiveCars(searchQuery);
  };

  const filteredCars = activeCars;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <CarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">السيارات المتاحة</h1>
              <p className="text-gray-600 text-sm">تصفح مجموعتنا الواسعة من السيارات المتاحة للمزاد</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="ابحث عن سيارة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-9 bg-gray-50 border-gray-200"
                  />
                </div>
                <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">بحث</Button>
              </form>

              <Badge variant="secondary" className="mr-auto md:mr-0 bg-primary/10 text-primary border-primary/20 whitespace-nowrap">
                {filteredCars.length} سيارة
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border shadow-sm">
              <CarIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">لا توجد سيارات مطابقة لبحثك</p>
            </div>
          ) : (
            filteredCars.map((car) => (
              <Card key={car.id} className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Link to={`/auction/${car.id}`}>
                  {/* Image Container */}
                  <div className="relative aspect-video overflow-hidden bg-gray-200">
                    {car.images?.[0]?.image ? (
                      <img
                        src={car.images[0].image}
                        alt={car.title}
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
                    <Badge className={`absolute top-3 left-3 border-0 px-3 py-1 text-xs backdrop-blur-sm z-20 ${car.status === 'SOON' ? 'bg-blue-500 text-white' : 'bg-green-500/90 text-white'
                      }`}>
                      {car.status === 'SOON' ? 'قريباً' : 'نشط'}
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
                          <span className="text-sm">
                            {car.status === 'SOON'
                              ? calculateTimeUntilStart(car.start_date)
                              : calculateTimeRemaining(car.start_date, car.auction_duration)}
                          </span>
                        </div>
                        <div className="text-left">
                          <div className="text-xs opacity-90">
                            {car.status === 'SOON' ? 'سعر البداية' : 'المزايدة الحالية'}
                          </div>
                          <div className="font-bold">
                            {Number(car.current_bid).toLocaleString()} ريال
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-4">
                    <h3 className="text-gray-900 mb-2 line-clamp-1">
                      {car.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">{car.description}</p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        {car.status === 'SOON' ? (
                          <span className="text-blue-500 font-medium">لم تبدأ بعد</span>
                        ) : (
                          <>
                            <Users className="w-4 h-4" />
                            <span>{car.bids_count} مزايدة</span>
                          </>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {car.brand}
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