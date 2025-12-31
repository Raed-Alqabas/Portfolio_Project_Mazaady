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
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { DepositDialog } from "./DepositDialog";

export function AuctionDetailsPage() {
  const { id } = useParams();
  const [bidAmount, setBidAmount] = useState("");
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositPaid, setDepositPaid] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 3,
    minutes: 25,
    seconds: 42,
  });

  // Mock auction data
  const auction = {
    id: 1,
    title: "تويوتا كامري 2023",
    description: "سيارة بحالة ممتازة، فحص شامل من الوكالة، صيانة دورية منتظمة",
    currentBid: 85000,
    startBid: 75000,
    minIncrement: 1000,
    bidsCount: 24,
    image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
    images: [
      "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
      "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=800",
      "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800",
    ],
    brand: "تويوتا",
    model: "كامري",
    year: 2023,
    mileage: 15000,
    fuel: "بنزين",
    transmission: "أوتوماتيك",
    color: "أبيض",
    location: "الرياض",
    vin: "JTDKARFU5L3123456",
    category: "سيدان",
  };

  const recentBids = [
    { user: "محمد ع.", amount: 85000, time: "منذ دقيقتين" },
    { user: "أحمد س.", amount: 84000, time: "منذ 5 دقائق" },
    { user: "خالد م.", amount: 83000, time: "منذ 8 دقائق" },
    { user: "فهد ا.", amount: 82000, time: "منذ 12 دقيقة" },
    { user: "سعد ح.", amount: 81000, time: "منذ 15 دقيقة" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePlaceBid = () => {
    // Check if deposit is paid first
    if (!depositPaid) {
      setDepositDialogOpen(true);
      return;
    }
    
    const amount = parseFloat(bidAmount);
    if (!amount || amount <= auction.currentBid) {
      toast.error("يجب أن يكون المبلغ أكبر من المزايدة الحالية");
      return;
    }
    if (amount < auction.currentBid + auction.minIncrement) {
      toast.error(`الحد الأدنى للزيادة هو ${auction.minIncrement.toLocaleString()} ريال`);
      return;
    }
    toast.success("تم تقديم مزايدتك بنجاح!");
    setBidAmount("");
  };

  const handleDepositPaid = () => {
    setDepositPaid(true);
  };

  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6 text-gray-600">
          <Link to="/" className="hover:text-blue-600">الرئيسية</Link>
          <span>/</span>
          <Link to="/auctions" className="hover:text-blue-600">المزادات</Link>
          <span>/</span>
          <span>{auction.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card className="overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={auction.images[selectedImage]}
                  alt={auction.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-red-500">
                  <Clock className="w-4 h-4 ml-1" />
                  ينتهي خلال {timeLeft.hours}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                </Badge>
              </div>
              <div className="p-4">
                <div className="flex gap-2">
                  {auction.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded overflow-hidden border-2 transition-colors ${
                        selectedImage === idx ? 'border-blue-600' : 'border-gray-200'
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
                    <CardTitle className="mb-2">{auction.title}</CardTitle>
                    <CardDescription>{auction.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{auction.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">السنة</p>
                      <p>{auction.year}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">الكيلومترات</p>
                      <p>{auction.mileage.toLocaleString()} كم</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">الوقود</p>
                      <p>{auction.fuel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">ناقل الحركة</p>
                      <p>{auction.transmission}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">اللون</p>
                    <p>{auction.color}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">الموقع</p>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{auction.location}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">رقم الهيكل</p>
                    <p className="text-xs font-mono">{auction.vin}</p>
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
                  {recentBids.map((bid, idx) => (
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
                      <p className="text-green-600">{bid.amount.toLocaleString()} ريال</p>
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
                  <CardTitle>المزايدة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">السعر الحالي</p>
                    <p className="text-green-600">{auction.currentBid.toLocaleString()} ريال</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">سعر البداية</p>
                    <p className="text-gray-900">{auction.startBid.toLocaleString()} ريال</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-gray-600 mb-1">عدد المزايدات</p>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>{auction.bidsCount} مزايدة</span>
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
                      مبلغ المزايدة (الحد الأدنى: {(auction.currentBid + auction.minIncrement).toLocaleString()} ريال)
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