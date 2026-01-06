import { Link } from "react-router";
import { Gavel, Car, TrendingUp, Clock, Shield, Users, Search, MapPin, Phone, Mail, ArrowRight, Star, Award, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { useState } from "react";
import { HeroSection } from "./HeroSection";
import logoImage from "../assets/main-logo.png";

export function HomePage() {
  const featuredAuctions = [
    {
      id: 1,
      title: "تويوتا كامري 2023",
      currentBid: 85000,
      endTime: "3 ساعات",
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500",
      bids: 24,
    },
    {
      id: 2,
      title: "مرسيدس E-Class 2022",
      currentBid: 180000,
      endTime: "5 ساعات",
      image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=500",
      bids: 31,
    },
    {
      id: 3,
      title: "هوندا أكورد 2024",
      currentBid: 95000,
      endTime: "2 ساعات",
      image: "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=500",
      bids: 18,
    },
  ];

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

  const [searchTerm, setSearchTerm] = useState("");
  const [carType, setCarType] = useState("all");
  const [region, setRegion] = useState("all");

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
            {featuredAuctions.map((auction) => (
              <Link to={`/auction/${auction.id}`} key={auction.id} className="block group">
                <div className="overflow-hidden rounded-lg">
                  {/* Image Container */}
                  <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gray-200">
                    <img
                      src={auction.image}
                      alt={auction.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                    {/* Featured Badge */}
                    <Badge className="absolute top-3 left-3 bg-gray-900/90 text-white hover:bg-gray-900 border-0 px-3 py-1 text-xs backdrop-blur-sm z-20">
                      FEATURED
                    </Badge>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 shadow-md flex items-center justify-center hover:scale-110 transition-transform z-20"
                    >
                      <Users className="w-4 h-4 text-gray-700" />
                    </button>

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between text-white z-10">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-sm">{auction.endTime}</span>
                      </div>
                      <div className="text-left">
                        <div className="text-xs opacity-90">Bid</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm">{auction.currentBid.toLocaleString()} ريال</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="bg-white p-3 rounded-b-lg">
                    <h3 className="text-gray-900 text-sm mb-2">{auction.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      <span>{auction.bids} مزايدة</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
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