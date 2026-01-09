import { Link } from "react-router";
import { Gavel, Car, TrendingUp, Clock, Shield, Users, Search, MapPin, Phone, Mail, ArrowRight, Star, Award, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";

import { HeroSection } from "./HeroSection";
import logoImage from "../assets/main-logo.png";
import api from "../api/axios";
import { CarCard } from "./CarCard";


export function HomePage() {
  const [activeCars, setActiveCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [carType, setCarType] = useState("all");
  const [region, setRegion] = useState("all");

  useEffect(() => {
    fetchActiveCars();
  }, []);

  const fetchActiveCars = async () => {
    try {
      const response = await api.get("/cars/public/");
      // Handle different response formats
      const data = response.data;
      if (Array.isArray(data)) {
        setActiveCars(data);
      } else if (data && Array.isArray(data.results)) {
        // Handle paginated response
        setActiveCars(data.results);
      } else {
        console.warn("Unexpected API response format:", data);
        setActiveCars([]);
      }
    } catch (error) {
      console.error("Error fetching active cars:", error);
      setActiveCars([]);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Shield,
      title: "معاملات آمنة",
      description: "نضمن لك أمان معاملاتك بنسبة 100%",
    },
    {
      icon: Clock,
      title: "مزادات مباشرة",
      description: "تحديثات فورية لجميع المزايدات",
    },
    {
      icon: Users,
      title: "مجتمع نشط",
      description: "آلاف المشترين والبائعين الموثوقين",
    },
    {
      icon: TrendingUp, 
      title: "أسعار تنافسية",
      description: "احصل على أفضل العروض والصفقات",
    },
  ];


  return (
    <div>
      {/* Hero Section */}
      {activeCars.length > 0 && <HeroSection auctions={activeCars.slice(0, 5)} />}

      {/* Featured Auctions */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Search Section */}
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-12 gap-4">
                <div className="md:col-span-5">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="ابحث عن سيارة..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10 bg-white"
                    />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <Select value={carType} onValueChange={setCarType}>
                    <SelectTrigger className="bg-white">
                      <Car className="w-4 h-4 ml-2" />
                      <SelectValue placeholder="نوع السيارة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      <SelectItem value="sedan">سيدان</SelectItem>
                      <SelectItem value="suv">دفع رباعي</SelectItem>
                      <SelectItem value="luxury">فاخرة</SelectItem>
                      <SelectItem value="sports">رياضية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3">
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger className="bg-white">
                      <MapPin className="w-4 h-4 ml-2" />
                      <SelectValue placeholder="المنطقة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المناطق</SelectItem>
                      <SelectItem value="riyadh">الرياض</SelectItem>
                      <SelectItem value="jeddah">جدة</SelectItem>
                      <SelectItem value="dammam">الدمام</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <Button className="w-full h-full">
                    بحث
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-8 bg-primary"></div>
              <span className="text-primary font-bold text-sm uppercase tracking-wider">سوقنا المباشر</span>
              <div className="h-px w-8 bg-primary"></div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4 text-center">
              المزادات المختارة بعناية
            </h2>
            <p className="text-gray-500 text-center max-w-2xl leading-relaxed">
              تصفح مجموعتنا الحصرية من السيارات المفحوصة والمضمونة. نضمن لك تجربة مزايدة شفافة وآمنة للوصول لسيارة أحلامك.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                  <Gavel className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
                </div>
                <p className="mt-4 text-gray-500 font-medium animate-pulse">جاري تحميل أفضل المزادات...</p>
              </div>
            ) : activeCars.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <Car className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد مزادات حالياً</h3>
                <p className="text-gray-500 max-w-xs mx-auto">ترقبوا قريباً، سيتم إضافة سيارات جديدة ومميزة للمنصة.</p>
              </div>
            ) : (
              activeCars.map((car) => {
                  return (
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
                      currentBid={car.latest_bid || car.start_bid}
                      endTime={new Date(new Date(car.created_at).getTime() + car.auction_duration * 24 * 60 * 60 * 1000).toISOString()}
                      image={car.images?.[0]?.image || ""}
                      featured={car.status === 'ACTIVE'}
                      isFavorited={car.is_favorited}
                    />
                  );
              })
            )}
          </div>

          <div className="mt-12 text-center">
            <Link to="/auctions">
              <Button variant="outline" size="lg" className="px-10 rounded-xl border-2 hover:bg-primary hover:text-white transition-all font-bold group">
                مشاهدة جميع السيارات
                <ArrowRight className="w-4 h-4 mr-2 rotate-180 group-hover:translate-x-[-4px] transition-transform" />
              </Button>
             </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-50/50 transition-colors">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Stats Section */}
      <section className="py-20 bg-primary text-white overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
               <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
            </svg>
         </div>
         <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-3 gap-12 text-center">
               <div className="space-y-4">
                  <div className="text-5xl font-black">+15,000</div>
                  <div className="text-blue-100 font-bold">مزاد تم بنجاح منذ 2023</div>
               </div>
               <div className="space-y-4">
                  <div className="text-5xl font-black">100%</div>
                  <div className="text-blue-100 font-bold">فحص فني مضمون قبل الشراء</div>
               </div>
               <div className="space-y-4">
                  <div className="text-5xl font-black">+50k</div>
                  <div className="text-blue-100 font-bold">مزايد نشط وموثوق شهرياً</div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}