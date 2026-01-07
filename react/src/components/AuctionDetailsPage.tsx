import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowRight,
  Clock,
  Users,
  Gavel,
  Car,
  Fuel,
  Gauge,
  Calendar,
  MapPin,
  Shield,
  FileText,
  TrendingUp,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { DepositDialog } from "./DepositDialog";
import api from "../api/axios";

export function AuctionDetailsPage() {
  const { id } = useParams();
  const [car, setCar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const [bidAmount, setBidAmount] = useState("");
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositPaid, setDepositPaid] = useState(false);

  // Keep mock time for now or adjust based on auction duration
  const [timeLeft, setTimeLeft] = useState({
    hours: 3,
    minutes: 25,
    seconds: 42,
  });

  const fetchCarDetails = async () => {
    try {
      const response = await api.get(`/cars/public/${id}/`);
      setCar(response.data);
    } catch (error) {
      console.error("Error fetching car details:", error);
      toast.error("حدث خطأ أثناء تحميل بيانات الإعلان");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePlaceBid = async () => {
    const currentBid = car?.current_bid || car?.start_bid || 0;
    const amount = parseFloat(bidAmount);

    if (!amount || amount <= currentBid) {
      toast.error(`يجب أن يكون المبلغ أكبر من المزايدة الحالية (${Number(currentBid).toLocaleString()} ريال)`);
      return;
    }

    // Virtual experiment: Update local state immediately to show the bid "working"
    setCar((prev: any) => ({
      ...prev,
      current_bid: amount,
      bids_count: (prev.bids_count || 0) + 1,
      recent_bids: [
        {
          user: "أنت (مزايدة افتراضية)",
          amount: amount,
          time: "الآن"
        },
        ...(prev.recent_bids || [])
      ]
    }));

    toast.success("تم تقديم مزايدتك بنجاح (تجربة افتراضية)!");
    setBidAmount("");

    // Optional: Still try to save to backend but don't block on it
    try {
      await api.post(`/cars/${id}/bid/`, { amount });
    } catch (error) {
      console.warn("Backend update skipped or failed during virtual experiment");
    }
  };

  const handleDepositPaid = () => setDepositPaid(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-gray-500">الإعلان غير موجود أو غير نشط</p>
        <Link to="/"><Button>العودة للرئيسية</Button></Link>
      </div>
    );
  }

  const carImages = car.images?.map((img: any) => img.image) || [];
  const startBidNum = Number(car.start_bid || 0);
  const currentBidNum = Number(car.current_bid || startBidNum);

  const recentBids = car.recent_bids || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6 text-gray-600">
          <Link to="/" className="hover:text-blue-600">الرئيسية</Link>
          <span>/</span>
          <Link to="/auctions" className="hover:text-blue-600">المزادات</Link>
          <span>/</span>
          <span>{car.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card className="overflow-hidden">
              <div className="aspect-video relative bg-gray-100 flex items-center justify-center">
                {carImages.length > 0 ? (
                  <img
                    src={carImages[selectedImage]}
                    alt={car.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Car className="w-16 h-16 text-gray-300" />
                )}
                <Badge className="absolute top-4 left-4 bg-red-500">
                  <Clock className="w-4 h-4 ml-1" />
                  ينتهي خلال {timeLeft.hours}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </Badge>
              </div>
              <div className="p-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {carImages.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded flex-shrink-0 overflow-hidden border-2 transition-colors ${selectedImage === idx ? 'border-blue-600' : 'border-gray-200'
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="mb-2">{car.title}</CardTitle>
                    <CardDescription>{car.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{car.brand}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">السنة</p>
                      <p>{car.year}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">الكيلومترات</p>
                      <p>{car.mileage?.toLocaleString()} كم</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">الوقود</p>
                      <p>{car.fuel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">ناقل الحركة</p>
                      <p>{car.transmission}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">اللون</p>
                    <p>{car.color}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">الموقع</p>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{car.location}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">رقم الهيكل</p>
                    <p className="text-xs font-mono">{car.vin || "غير متوفر"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">سعة المحرك</p>
                    <p>{car.engine_size} لتر</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-900 mb-1">معلومات الفحص</p>
                    <p className="text-sm text-blue-700">
                      السيارة خضعت لفحص شامل من قبل خبراء معتمدين وحصلت على تقييم ممتاز
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Bids */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  سجل المزايدات ({recentBids.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentBids.map((bid: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p>{bid.user}</p>
                          <p className="text-sm text-gray-600">{bid.time}</p>
                        </div>
                      </div>
                      <p className="text-green-600">{Number(bid.amount).toLocaleString()} ريال</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="sticky top-20 self-start">
            <div className="space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {/* Bidding Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>المزايدة</CardTitle>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      تجربة افتراضية
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">السعر الحالي</p>
                    <p className="text-green-600">{currentBidNum.toLocaleString()} ريال</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">سعر البداية</p>
                    <p className="text-gray-900">{startBidNum.toLocaleString()} ريال</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-gray-600 mb-1">عدد المزايدات</p>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>{car.bids_count || 0} مزايدة</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">الوقت المتبقي</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-500" />
                      <span className="text-red-500">
                        {timeLeft.hours}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">
                      مبلغ المزايدة (الحد الأدنى: {(currentBidNum + 1000).toLocaleString()} ريال)
                    </label>
                    <Input
                      type="number"
                      placeholder="أدخل مبلغ المزايدة"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="mb-3"
                    />
                    <Button
                      className="w-full gap-2"
                      size="lg"
                      onClick={handlePlaceBid}
                    >
                      <Gavel className="w-5 h-5" />
                      قدم مزايدتك
                    </Button>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
                    <p className="flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      بتقديم المزايدة، انت توافق على الشروط والأحكام الخاصة بالمنصة
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileText className="w-4 h-4" />
                    عرض تقرير الفحص
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Car className="w-4 h-4" />
                    طلب معاينة السيارة
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Shield className="w-4 h-4" />
                    طلب سجل الصيانة
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <DepositDialog
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
        onDepositPaid={handleDepositPaid}
      />
    </div>
  );
}