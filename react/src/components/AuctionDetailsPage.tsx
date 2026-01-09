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
  Heart
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { DepositDialog } from "./DepositDialog";
import { getProfile } from "../api/profile";
import api from "../api/axios";

export function AuctionDetailsPage() {
  const { id } = useParams();
  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositPaid, setDepositPaid] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const fetchAuctionDetails = async () => {
    try {
      const response = await api.get(`/auctions/${id}/`);
      setAuction(response.data);
      setLoading(false);
      
      // Calculate time left based on created_at and auction_duration
      const createdAt = new Date(response.data.created_at);
      const durationDays = response.data.auction_duration;
      const endTime = new Date(createdAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();
      
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    } catch (error) {
      console.error("Failed to fetch auction details", error);
      toast.error("فشل في تحميل تفاصيل المزاد");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctionDetails();
    
    // Polling for updates every 5 seconds
    const pollInterval = setInterval(fetchAuctionDetails, 5000);

    // Bidding access check
    getProfile().then(data => {
        if (data.bidding_access) {
            setDepositPaid(true);
        }
    }).catch(err => {
        console.log("Not logged in or error checking profile", err);
    });

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

    return () => {
        clearInterval(timer);
        clearInterval(pollInterval);
    };
  }, [id]);

  const handlePlaceBid = async () => {
    // Check if deposit is paid first
    if (!depositPaid) {
      setDepositDialogOpen(true);
      return;
    }
    
    const amount = parseFloat(bidAmount);
    const currentPrice = auction.bids.length > 0 ? auction.bids[0].amount : auction.start_bid;
    
    if (!amount || amount <= currentPrice) {
      toast.error("يجب أن يكون المبلغ أكبر من المزايدة الحالية");
      return;
    }
    
    const minIncrement = 1000;
    if (amount < currentPrice + minIncrement) {
      toast.error(`الحد الأدنى للزيادة هو ${minIncrement.toLocaleString()} ريال`);
      return;
    }

    try {
        await api.post(`/auctions/${id}/bid/`, { amount });
        toast.success("تم تقديم مزايدتك بنجاح!");
        setBidAmount("");
        fetchAuctionDetails(); // Refresh immediately
    } catch (error: any) {
        if (error.response?.data?.error === 'ACCESS_DENIED') {
            setDepositDialogOpen(true);
        } else {
            toast.error(error.response?.data?.error || "فشل تقديم المزايدة");
        }
    }
  };

  const handleDepositPaid = () => {
    setDepositPaid(true);
  };

  const [selectedImage, setSelectedImage] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>المزاد غير موجود</p>
      </div>
    );
  }

  const currentPrice = auction.bids.length > 0 ? auction.bids[0].amount : auction.start_bid;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-bold">
          <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <ArrowRight className="w-3 h-3 rotate-180" />
          <Link to="/auctions" className="hover:text-primary transition-colors">المزادات</Link>
          <ArrowRight className="w-3 h-3 rotate-180" />
          <span className="text-gray-900">{auction.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Main Header */}
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">{auction.title}</h1>
              <div className="flex items-center gap-2 text-gray-500 font-bold">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{auction.location}</span>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                {auction.images && auction.images.length > 0 ? (
                  <img
                    src={`${(import.meta as any).env.VITE_API_URL}${auction.images[selectedImage].image}`}
                    alt={auction.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {auction.images?.map((img: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? 'border-primary ring-2 ring-primary/10' : 'border-transparent'
                    }`}
                  >
                    <img src={`${(import.meta as any).env.VITE_API_URL}${img.image}`} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Car Details Grid */}
            <Card className="border-0 bg-gray-50 shadow-sm rounded-3xl">
              <CardContent className="p-8">
                 <h3 className="text-lg font-black mb-6">المواصفات الأساسية</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center">
                      <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="text-xs text-gray-400 font-bold mb-1">السنة</p>
                      <p className="text-gray-900 font-black">{auction.year}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center">
                      <Gauge className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="text-xs text-gray-400 font-bold mb-1">المسافة</p>
                      <p className="text-gray-900 font-black">{auction.mileage?.toLocaleString() ?? "0"} كم</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center">
                      <Fuel className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="text-xs text-gray-400 font-bold mb-1">الوقود</p>
                      <p className="text-gray-900 font-black">{auction.fuel}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center">
                      <Car className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="text-xs text-gray-400 font-bold mb-1">ناقل الحركة</p>
                      <p className="text-gray-900 font-black">{auction.transmission}</p>
                    </div>
                 </div>
              </CardContent>
            </Card>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-gray-900">وصف السيارة</h3>
              <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
                {auction.description}
              </p>
            </div>

            {/* Bidding History */}
            <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden border border-gray-50">
              <CardHeader className="bg-gray-50 py-4 px-8">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  سجل المزايدات
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-50">
                  {auction.bids.map((bid: any, index: number) => (
                    <div key={index} className={`flex items-center justify-between p-6 ${bid.is_mine ? 'bg-primary/5' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-sm ${bid.is_mine ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                           {bid.is_mine ? bid.username.charAt(0) : '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900">{bid.is_mine ? bid.username : 'مزايد مخفي'}</p>
                            {bid.is_mine && <Badge variant="outline" className="text-[10px] text-primary border-primary">أنت</Badge>}
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold">{bid.user_masked_id}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-black text-primary">{bid.amount?.toLocaleString() ?? "0"} ريال</p>
                        <p className="text-[10px] text-gray-400 font-bold">الرتبة: #{bid.rank}</p>
                      </div>
                    </div>
                  ))}
                  {auction.bids.length === 0 && (
                    <div className="py-12 text-center text-gray-400 font-bold">
                       لا توجد مزايدات حتى الآن
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-24 border-0 shadow-lg rounded-[2rem] bg-white overflow-hidden border border-gray-50">
              <CardHeader className="bg-primary text-white p-8">
                <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">المزايدة الحالية</p>
                <CardTitle className="text-4xl font-black">
                  {currentPrice?.toLocaleString() ?? "0"} <span className="text-sm font-normal">ريال</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl text-center">
                    <p className="text-[10px] text-gray-400 font-bold mb-1">الوقت المتبقي</p>
                    <div className="flex items-center justify-center gap-2 text-red-600 font-black">
                      <Clock className="w-4 h-4" />
                      <span>{timeLeft.hours}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl text-center">
                    <p className="text-[10px] text-gray-400 font-bold mb-1">المزايدات</p>
                    <div className="flex items-center justify-center gap-2 text-gray-900 font-black">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{auction.bids.length}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-2 block mr-1">
                      قدم عرضك (أقل زيادة: 1,000 ريال)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="أدخل مبلغ المزايدة"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="h-14 rounded-2xl pr-4 border-gray-100 font-bold text-lg bg-gray-50 focus:bg-white transition-all shadow-inner"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">ريال</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3"
                    onClick={handlePlaceBid}
                  >
                    <Gavel className="w-5 h-5" />
                    تقديم المزايدة
                  </Button>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                   <h4 className="text-sm font-black text-gray-900">إجراءات سريعة</h4>
                   <Button variant="outline" className="w-full rounded-xl justify-start gap-3 border-gray-100 text-gray-600 font-bold hover:bg-gray-50">
                      <FileText className="w-4 h-4 text-primary" />
                      تقرير الفحص الفني
                   </Button>
                   <Button variant="outline" className="w-full rounded-xl justify-start gap-3 border-gray-100 text-gray-600 font-bold hover:bg-gray-50">
                      <Shield className="w-4 h-4 text-green-500" />
                      ضمان منصة مزادي
                   </Button>
                </div>
              </CardContent>
            </Card>
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