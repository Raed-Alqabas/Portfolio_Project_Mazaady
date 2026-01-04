import { useState } from "react";
import { Link } from "react-router";
import { Car, Fuel, Gauge, Calendar, MapPin, Filter, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CarCard } from "./CarCard";

export function CarsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const cars = [
    {
      id: 1,
      title: "تويوتا كامري 2023 GLE",
      brand: "تويوتا",
      model: "كامري GLE",
      year: 2023,
      mileage: 15000,
      fuel: "بنزين",
      transmission: "أوتوماتيك",
      location: "الرياض، السعودية 12345",
      currentBid: 85000,
      timeLeft: "5:50:46",
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
      category: "سيدان",
      featured: true,
      highBid: false,
    },
    {
      id: 2,
      title: "مرسيدس E-Class 2022 فخامة مميزة",
      brand: "مرسيدس",
      model: "E-Class فخامة مميزة",
      year: 2022,
      mileage: 28000,
      fuel: "بنزين",
      transmission: "أوتوماتيك",
      location: "جدة، السعودية 21589",
      currentBid: 180000,
      timeLeft: "5:54:46",
      image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800",
      category: "سيدان",
      featured: false,
      highBid: true,
    },
    {
      id: 3,
      title: "شيفروليه كورفيت 2016 Z06 C7.R طبعة محدودة",
      brand: "شيفروليه",
      model: "كورفيت Z06 C7.R",
      year: 2016,
      mileage: 95500,
      fuel: "بنزين سوبر تشارج V8",
      transmission: "أوتوماتيك",
      location: "كينغمان، أريزونا 86409",
      currentBid: 250000,
      timeLeft: "5:56:46",
      image: "https://images.unsplash.com/photo-1647340764627-11713b9d0f65?w=800",
      category: "سيارات رياضية",
      featured: true,
      highBid: true,
    },
    {
      id: 4,
      title: "سوبارو ليجاسي GT-B 1999 E-Tune واغن",
      brand: "سوبارو",
      model: "ليجاسي GT-B E-Tune",
      year: 1999,
      mileage: 120000,
      fuel: "بنزين توين تيربو",
      transmission: "أوتوماتيك",
      location: "سيريس، كاليفورنيا 95307",
      currentBid: 45000,
      timeLeft: "6:02:46",
      image: "https://images.unsplash.com/photo-1639280791656-5f8506ff21d2?w=800",
      category: "واغن",
      featured: false,
      highBid: false,
    },
    {
      id: 5,
      title: "لكزس ES 2023 هايبرد",
      brand: "لكزس",
      model: "ES هايبرد",
      year: 2023,
      mileage: 8000,
      fuel: "هايبرد",
      transmission: "أوتوماتيك",
      location: "مكة المكرمة، السعودية",
      currentBid: 145000,
      timeLeft: "4:30:20",
      image: "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800",
      category: "سيدان",
      featured: true,
      highBid: true,
    },
    {
      id: 6,
      title: "جيب رانجلر 2022 روبيكون",
      brand: "جيب",
      model: "رانجلر روبيكون",
      year: 2022,
      mileage: 35000,
      fuel: "بنزين",
      transmission: "أوتوماتيك",
      location: "الخبر، السعودية",
      currentBid: 165000,
      timeLeft: "3:45:15",
      image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800",
      category: "دفع رباعي",
      featured: false,
      highBid: false,
    },
    {
      id: 7,
      title: "هيونداي سوناتا 2024 جديدة كلياً",
      brand: "هيونداي",
      model: "سوناتا",
      year: 2024,
      mileage: 0,
      fuel: "بنزين",
      transmission: "أوتوماتيك",
      location: "الرياض، السعودية",
      currentBid: 78000,
      timeLeft: "2:15:50",
      image: "https://images.unsplash.com/photo-1658662160331-62f7e52e63de?w=800",
      category: "سيدان",
      featured: false,
      highBid: false,
    },
    {
      id: 8,
      title: "نيسان باترول 2023 بلاتينيوم",
      brand: "نيسان",
      model: "باترول بلاتينيوم",
      year: 2023,
      mileage: 22000,
      fuel: "بنزين",
      transmission: "أوتوماتيك",
      location: "جدة، السعودية",
      currentBid: 195000,
      timeLeft: "6:20:30",
      image: "https://images.unsplash.com/photo-1684965747763-9b8fc4f721f3?w=800",
      category: "دفع رباعي",
      featured: true,
      highBid: false,
    },
  ];

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         car.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || car.category === categoryFilter;
    return matchesSearch && matchesCategory;
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCars.map((car) => (
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}