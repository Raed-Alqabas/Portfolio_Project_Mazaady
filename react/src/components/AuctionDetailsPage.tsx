import { useState, useEffect } from "react";
import { useParams, Link, useOutletContext } from "react-router";
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
  Loader2,
  Trophy
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { DepositDialog } from "./DepositDialog";
import { PaymentConfirmDialog } from "./PaymentConfirmDialog";
import api from "../api/axios";
import { calculateTimeRemaining, isAuctionEnded } from "../utils/timeUtils";

interface AuthContextType {
  user: { name: string; email: string } | null;
  setAuthOpen: (open: boolean) => void;
}

export function AuctionDetailsPage() {
  const { id } = useParams();
  const { user, setAuthOpen } = useOutletContext<AuthContextType>();
  const [car, setCar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const [bidAmount, setBidAmount] = useState("");
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [depositPaid, setDepositPaid] = useState(false);
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);

  // Animation State
  const [isPriceUpdated, setIsPriceUpdated] = useState(false);

  // Track current time for live countdown
  const [currentTime, setCurrentTime] = useState(Date.now());

  const fetchCarDetails = async (showError = true) => {
    try {
      const response = await api.get(`/cars/public/${id}/`);
      setCar(response.data);
    } catch (error) {
      console.error("Error fetching car details:", error);
      if (showError) toast.error("حدث خطأ أثناء تحميل بيانات الإعلان");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  // Real-time polling for bids and price
  useEffect(() => {
    const interval = setInterval(() => {
      // Fetch silently to update price/bids without disturbing user
      if (id) fetchCarDetails(false);
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [id]);

  // Watch for price changes to trigger animation
  useEffect(() => {
    if (car?.current_bid) {
      setIsPriceUpdated(true);
      const timer = setTimeout(() => setIsPriceUpdated(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [car?.current_bid]);

  // Update time every second for live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePlaceBid = async () => {
    // 1. Auth Guard: Check if user is logged in
    if (!user) {
      toast.error("يرجى تسجيل الدخول أولاً للمشاركة في المزاد");
      setAuthOpen(true);
      return;
    }

    // Validate bid amount first
    const currentBid = car?.current_bid || car?.start_bid || 0;
    const amount = parseFloat(bidAmount);

    if (!amount || amount <= currentBid) {
      toast.error(`يجب أن يكون المبلغ أكبر من المزايدة الحالية (${Number(currentBid).toLocaleString()} ريال)`);
      return;
    }

    try {
      await api.post(`/cars/${id}/bid/`, { amount });
      toast.success("تم تقديم مزايدتك بنجاح!");
      setBidAmount("");
      // Refresh data
      fetchCarDetails();
    } catch (error: any) {
      console.error("Error placing bid:", error);
      
      // Check if payment is required (402 status)
      if (error.response?.status === 402 || error.response?.data?.payment_required) {
        toast.error("يجب دفع رسوم الاشتراك (1500 ريال) قبل المزايدة");
        
        // Show payment confirmation dialog
        setPaymentDialogOpen(true);
        return;
      }
      
      const message = error.response?.data?.error || error.response?.data?.message || "حدث خطأ أثناء تقديم المزايدة";
      toast.error(message);
    }
  };

  const handleDepositPaid = () => setDepositPaid(true);

  const handleConfirmPayment = async () => {
    try {
      setIsRedirectingToPayment(true);
      const paymentResponse = await api.get(`/pay-bidding-access/?car_id=${id}`);
      const paymentUrl = paymentResponse.data.payment_url;
      
      // Redirect to Tap payment
      window.location.href = paymentUrl;
    } catch (paymentError) {
      console.error('Payment initiation error:', paymentError);
      toast.error('حدث خطأ أثناء بدء عملية الدفع');
      setIsRedirectingToPayment(false);
    }
  };

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
      {/* Payment Redirect Loading Overlay - Minimal */}
      {isRedirectingToPayment && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center overflow-hidden">
          {/* Floating Money Elements Background - Evenly Distributed */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(15)].map((_, i) => {
              // Create a 5x3 grid for better distribution
              const row = Math.floor(i / 5);
              const col = i % 5;
              const baseLeft = (col * 20) + 10; // 20% spacing with 10% offset
              const baseTop = (row * 33) + 10;  // 33% spacing with 10% offset
              // Add small random offset to avoid perfect grid
              const randomOffsetX = (Math.random() - 0.5) * 10;
              const randomOffsetY = (Math.random() - 0.5) * 10;
              
              return (
                <div
                  key={i}
                  className="absolute text-4xl animate-float"
                  style={{
                    left: `${baseLeft + randomOffsetX}%`,
                    top: `${baseTop + randomOffsetY}%`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: `${4 + (i % 3)}s`,
                    opacity: 0.3,
                  }}
                >
                  {['💰', '💳', '💵', '💴', '💶', '💷', '🪙', '✨'][i % 8]}
                </div>
              );
            })}
          </div>

          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              25% { transform: translateY(-30px) rotate(10deg); }
              50% { transform: translateY(-60px) rotate(-10deg); }
              75% { transform: translateY(-30px) rotate(5deg); }
            }
            .animate-float {
              animation: float ease-in-out infinite;
            }
          `}</style>

          {/* Just the Spinner - No Text */}
          <div className="relative z-10">
            <div className="w-32 h-32 rounded-full mx-auto relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-spin" style={{ padding: '4px' }}>
                <div className="w-full h-full rounded-full bg-black/80 backdrop-blur"></div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <Badge className={`absolute top-4 left-4 ${car.status === 'CLOSED' || isAuctionEnded(car.start_date, car.auction_duration) ? 'bg-gray-600' :
                  car.status === 'PENDING' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                  <Clock className="w-4 h-4 ml-1" />
                  {car.status === 'CLOSED' || isAuctionEnded(car.start_date, car.auction_duration) ? 'المزاد منتهي' :
                    car.status === 'PENDING' ? `يبدأ خلال ${calculateTimeRemaining(car.start_date, car.auction_duration)}` :
                      `ينتهي خلال ${calculateTimeRemaining(car.start_date, car.auction_duration)}`}
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
                  <CardTitle>المزايدة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {car.status === 'CLOSED' ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gavel className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">المزاد مغلق</h3>

                      {car.winner ? (
                        user?.name === car.winner ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-pulse">
                            <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <p className="font-bold text-green-800 text-lg">مبروك! لقد ربحت المزاد</p>
                            <p className="text-green-600 text-sm mt-1">سيتم التواصل معك قريباً لإتمام الإجراءات</p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-gray-600 mb-1">بيعت السيارة لـ</p>
                            <p className="font-bold text-gray-900 text-lg">{car.winner}</p>
                            <p className="text-green-600 font-bold mt-2">{Number(car.current_bid).toLocaleString()} ريال</p>
                          </div>
                        )
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <p className="text-gray-500">انتهى الوقت ولم يتم البيع</p>
                        </div>
                      )}
                    </div>

                  ) : car.status === 'PENDING' ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Clock className="w-8 h-8 text-yellow-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">سيبدأ المزاد قريباً</h3>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 font-bold text-2xl">
                          {calculateTimeRemaining(car.start_date, car.auction_duration)}
                        </p>
                        <p className="text-yellow-600 text-sm mt-1">يبدأ في {new Date(car.start_date).toLocaleString('ar-SA')}</p>
                      </div>
                    </div>
                  ) : isAuctionEnded(car.start_date, car.auction_duration) ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gavel className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">المزاد مغلق</h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600 font-bold text-lg">انتهى وقت المزاد</p>
                        <p className="text-red-500 text-sm mt-1">يرجى الانتظار حتى يتم تحديث النتائج</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <style>
                        {`
                          @keyframes shake-zoom {
                            0% { transform: scale(1) rotate(0deg); }
                            25% { transform: scale(1.3) rotate(-5deg); }
                            50% { transform: scale(1.3) rotate(5deg); }
                            75% { transform: scale(1.3) rotate(-5deg); }
                            100% { transform: scale(1) rotate(0deg); }
                          }
                          .animate-shake-zoom {
                            animation: shake-zoom 0.5s ease-in-out;
                          }
                        `}
                      </style>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">السعر الحالي</p>
                        <p
                          className={`text-2xl font-bold transition-all duration-300 ${isPriceUpdated
                            ? "text-green-600 animate-shake-zoom bg-green-50 px-2 rounded"
                            : "text-green-600"
                            }`}
                        >
                          {currentBidNum.toLocaleString()} ريال
                        </p>
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
                          <Clock className={`w-4 h-4 ${isAuctionEnded(car.start_date, car.auction_duration) ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
                          <span className={`${isAuctionEnded(car.start_date, car.auction_duration) ? 'text-red-500 font-bold' : 'text-gray-900'}`}>
                            {calculateTimeRemaining(car.start_date, car.auction_duration)}
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
                          placeholder={isAuctionEnded(car.start_date, car.auction_duration) ? "المزاد منتهي" : "أدخل مبلغ المزايدة"}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          disabled={isAuctionEnded(car.start_date, car.auction_duration)}
                          className="mb-3"
                        />
                        <Button
                          className="w-full gap-2"
                          size="lg"
                          onClick={handlePlaceBid}
                          disabled={isAuctionEnded(car.start_date, car.auction_duration)}
                        >
                          <Gavel className="w-5 h-5" />
                          {isAuctionEnded(car.start_date, car.auction_duration) ? "المزاد منتهي" : "قدم مزايدتك"}
                        </Button>
                      </div>

                      <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
                        <p className="flex items-start gap-2">
                          <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          بتقديم المزايدة، انت توافق على الشروط والأحكام الخاصة بالمنصة
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    disabled={!car.inspection_report}
                    onClick={() => {
                      if (car.inspection_report) window.open(car.inspection_report, '_blank');
                    }}
                  >
                    <FileText className="w-4 h-4" />
                    {car.inspection_report ? "عرض تقرير الفحص" : "تقرير الفحص غير متوفر"}
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
      <PaymentConfirmDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
}