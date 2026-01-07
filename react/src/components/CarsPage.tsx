import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Car as CarIcon, Fuel, Gauge, Calendar, MapPin, Filter, Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CarCard } from "./CarCard";
import api from "../api/axios";

export function CarsPage() {
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredCars = activeCars.filter(car => {
    const matchesSearch = car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
          <CardContent className="p-6">
            <div className="grid md:grid-cols-12 gap-4">
              <div className="md:col-span-8">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="ابحث عن سيارة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 bg-gray-50 border-gray-200"
                  />
                </div>
              </div>
              <div className="md:col-span-4 flex items-center justify-end">
                <Badge variant="secondary" className="text-sm bg-primary/10 text-primary border-primary/20">
                  {filteredCars.length} سيارة
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cars Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <CarCard
                key={car.id}
                id={car.id}
                title={car.title}
                brand={car.brand}
                model={car.model}
                year={car.year}
                mileage={car.mileage}
                fuel={car.fuel}
                transmission={car.transmission}
                location={car.location}
                currentBid={Number(car.current_bid)}
                timeLeft={`${car.auction_duration} أيام`}
                image={car.images?.[0]?.image}
                featured={false}
                highBid={false}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}