
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Car, Fuel, Gauge, Calendar, MapPin, Filter, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CarCard } from "./CarCard";
import { getPublicCars, Car as CarType } from "../api/cars";

export function CarsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cars, setCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await getPublicCars();
        setCars(data);
      } catch (error) {
        console.error("Failed to fetch cars", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         car.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || car.category === categoryFilter; // Category logic needs refinement if backend doesn't support it yet
    return matchesSearch; // Simplified for now as category is placeholder
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <Car className="w-6 h-6 text-white" />
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
              <div className="md:col-span-6">
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
              <div className="md:col-span-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="bg-gray-50 border-gray-200">
                    <SelectValue placeholder="الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    <SelectItem value="سيدان">سيدان</SelectItem>
                    <SelectItem value="دفع رباعي">دفع رباعي</SelectItem>
                    <SelectItem value="سيارات رياضية">سيارات رياضية</SelectItem>
                    <SelectItem value="واغن">واغن</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3 flex items-center gap-2">
                <Badge variant="secondary" className="text-sm bg-primary/10 text-primary border-primary/20">
                  {filteredCars.length} سيارة
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cars Grid */}
        {loading ? (
             <div className="text-center py-10">تحميل...</div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCars.length > 0 ? filteredCars.map((car) => (
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
                currentBid={car.currentBid}
                timeLeft={car.timeLeft}
                image={car.image}
                featured={car.featured}
                highBid={car.highBid}
                isFavorited={car.is_favorited}
                />
            )) : (
                <div className="col-span-full text-center py-10 text-gray-500">لا توجد سيارات متاحة حالياً</div>
            )}
            </div>
        )}
      </div>
    </div>
  );
}