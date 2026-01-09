
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Gavel, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { getPublicCars, Car as CarType } from "../api/cars";
import { CarCard } from "./CarCard";

export function AuctionsPage() {
  const [filter, setFilter] = useState("all");
  const [auctions, setAuctions] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const data = await getPublicCars();
        // Since public_cars only returns active, this might limit us, but it's consistent for now.
        setAuctions(data);
      } catch (error) {
        console.error("Failed to fetch auctions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  const filteredAuctions = filter === "all" 
    ? auctions 
    : auctions.filter(a => {
        if (filter === 'active') return a.status === 'ACTIVE';
        // Logic for other filters if we had them or derived them
        return true; 
    });

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
        {loading ? (
             <div className="text-center py-10">تحميل...</div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.length > 0 ? filteredAuctions.map((auction) => (
                <CarCard
                key={auction.id}
                id={auction.id}
                title={auction.title}
                brand={auction.brand}
                model={auction.model}
                year={auction.year}
                mileage={auction.mileage}
                fuel={auction.fuel}
                transmission={auction.transmission}
                location={auction.location}
                currentBid={auction.currentBid}
                timeLeft={auction.timeLeft}
                image={auction.image}
                featured={auction.featured}
                highBid={auction.highBid}
                isFavorited={auction.is_favorited}
                />
            )) : (
                <div className="col-span-full text-center py-10 text-gray-500">لا توجد مزادات متاحة</div>
            )}
            </div>
        )}
      </div>
    </div>
  );
}