import { Link } from "react-router";
import { Gavel, Car, TrendingUp, Clock, Shield, Users, Search, MapPin, Phone, Mail, ArrowRight, Star, Award, CheckCircle, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { HeroSection } from "./HeroSection";
import logoImage from "../assets/main-logo.png";
import api from "../api/axios";


export function HomePage() {
  const [activeCars, setActiveCars] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [carType, setCarType] = useState("all");
  const [region, setRegion] = useState("all");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchActiveCars();
    fetchUserFavorites();

    // Listen for favorites changes from other components
    const handleFavoritesChange = () => {
      const stored = localStorage.getItem('favorites');
      if (stored) {
        setFavorites(new Set<number>(JSON.parse(stored)));
      }
    };

    window.addEventListener('favoritesChanged', handleFavoritesChange);
    return () => window.removeEventListener('favoritesChanged', handleFavoritesChange);
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

  const fetchUserFavorites = async () => {
    try {
      const response = await api.get("/favorites/");
      const favoriteIds = new Set<number>(response.data.map((fav: any) => fav.car.id));
      setFavorites(favoriteIds);
      // Also save to localStorage
      localStorage.setItem('favorites', JSON.stringify(Array.from(favoriteIds)));
    } catch (error) {
      // User might not be logged in, try localStorage
      const stored = localStorage.getItem('favorites');
      if (stored) {
        setFavorites(new Set<number>(JSON.parse(stored)));
      }
    }
  };

  const toggleFavorite = async (carId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isFavorited = favorites.has(carId);

    try {
      if (isFavorited) {
        await api.delete(`/favorites/${carId}/remove/`);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(carId);
          // Save to localStorage for persistence
          localStorage.setItem('favorites', JSON.stringify(Array.from(newSet)));
          // Notify other components
          window.dispatchEvent(new Event('favoritesChanged'));
          return newSet;
        });
        toast.success("تمت إزالة السيارة من المفضلة");
      } else {
        await api.post(`/favorites/${carId}/add/`);
        setFavorites(prev => {
          const newSet = new Set(prev).add(carId);
          // Save to localStorage for persistence
          localStorage.setItem('favorites', JSON.stringify(Array.from(newSet)));
          // Notify other components
          window.dispatchEvent(new Event('favoritesChanged'));
          return newSet;
        });
        toast.success("تمت إضافة السيارة للمفضلة");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("يرجى تسجيل الدخول لإضافة المفضلة");
      } else {
        toast.error("حدث خطأ، حاول مرة أخرى");
      }
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
      <HeroSection />

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
                      <SelectItem value="sports">رياضية</SelectItem>
                      <SelectItem value="truck">شاحنة</SelectItem>
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
                      <SelectItem value="makkah">مكة</SelectItem>
                      <SelectItem value="madinah">المدينة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-1">
                  <Link to="/auctions">
                    <Button className="w-full">
                      <Search className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="mb-2">المزادات المميزة</h2>
              <p className="text-gray-600">أحدث المزادات النشطة الآن</p>
            </div>
            <Link to="/auctions">
              <Button variant="outline" className="gap-2">
                عرض الكل
                <TrendingUp className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : activeCars.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg border shadow-sm">
                <Car className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد مزادات نشطة حالياً</p>
              </div>
            ) : (
              activeCars.map((car) => {
                const mainImage = car.images?.[0]?.image;

                return (
                  <Link to={`/auction/${car.id}`} key={car.id} className="block group">
                    <div className="overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all duration-300">
                      {/* Image Container */}
                      <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gray-200">
                        {mainImage ? (
                          <img
                            src={mainImage}
                            alt={car.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <Car className="w-10 h-10 text-gray-300" />
                          </div>
                        )}

                        {/* Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                        {/* Featured Badge */}
                        <Badge className="absolute top-3 left-3 bg-primary text-white hover:bg-primary border-0 px-3 py-1 text-xs backdrop-blur-sm z-20">
                          نشط
                        </Badge>

                        {/* Location Badge */}
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm shadow-sm rounded-full px-2.5 py-1 flex items-center gap-1 z-20">
                          <MapPin className="w-3 h-3 text-gray-700" />
                          <span className="text-xs text-gray-700">{car.location}</span>
                        </div>

                        {/* Bottom Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between text-white z-10">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="text-sm">{car.auction_duration} أيام</span>
                          </div>
                          <div className="text-left">
                            <div className="text-xs opacity-90">سعر البداية</div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-bold">{parseInt(car.start_bid).toLocaleString()} ريال</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="bg-white p-4 rounded-b-lg relative">
                        <h3 className="text-gray-900 font-semibold mb-2 line-clamp-1">{car.title}</h3>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              <span>{car.brand} {car.model}</span>
                            </div>
                            <span>{car.year}</span>
                          </div>
                          
                          {/* Heart Icon in Footer */}
                          <button
                            onClick={(e) => toggleFavorite(car.id, e)}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <Heart
                              className={`w-4 h-4 ${favorites.has(car.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">لماذا تختار منصتنا؟</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              نوفر لك تجربة مزادات آمنة وسهلة مع أفضل الخدمات
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="mb-4">تواصل معنا</h2>
              <p className="text-gray-600">
                نحن هنا لمساعدتك في أي استفسار أو طلب
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="mb-1">البريد الإلكتروني</h3>
                      <p className="text-sm text-gray-600">راسلنا في أي وقت</p>
                    </div>
                  </div>
                  <a
                    href="mailto:info@mazady.sa"
                    className="text-blue-600 hover:text-blue-700 transition-colors block p-3 bg-blue-50 rounded-lg text-center"
                  >
                    info@mazady.sa
                  </a>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    سنرد عليك خلال 24 ساعة
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                      <h3 className="mb-1">الهاتف</h3>
                      <p className="text-sm text-gray-600">اتصل بنا مباشرة</p>
                    </div>
                  </div>
                  <a
                    href="tel:+966920001234"
                    className="text-green-600 hover:text-green-700 transition-colors block p-3 bg-green-50 rounded-lg text-center"
                  >
                    920001234
                  </a>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    الأحد - الخميس (9 ص - 5 م)
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 bg-blue-900 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8" />
                    <div>
                      <p className="mb-1">خدمة عملاء متميزة</p>
                      <p className="text-sm text-blue-200">نحن دائماً بجانبك لمساعدتك</p>
                    </div>
                  </div>
                  <Button variant="secondary" className="gap-2">
                    <Mail className="w-4 h-4" />
                    راسلنا الآن
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}