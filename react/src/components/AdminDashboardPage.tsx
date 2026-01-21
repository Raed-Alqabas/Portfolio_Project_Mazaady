import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  Users, 
  Activity, 
  TrendingUp, 
  DollarSign,
  ShieldCheck,
  Package,
  Gavel,
  Clock,
  UserPlus,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  FileText,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import axios from "../api/axios";
import { toast } from "sonner";

interface DashboardData {
  userActivity: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    usersWithAccess: number;
  };
  auctionLifecycle: {
    totalCars: number;
    activeCars: number;
    closedCars: number;
    pendingCars: number;
    rejectedCars: number;
  };
  biddingVolume: {
    totalBids: number;
    bidsToday: number;
    bidsThisWeek: number;
    topBidders: Array<{
      username: string;
      bidCount: number;
      totalAmount: number;
    }>;
  };
  revenue: {
    totalRevenue: number;
    biddingRevenue: number;
    revenueToday: number;
  };
  recentActivity: {
    recentUsers: Array<{
      username: string;
      email: string;
      joined: string;
    }>;
    recentBids: Array<{
      user: string;
      car: string;
      amount: number;
      time: string;
    }>;
    recentCars: Array<{
      id: number;
      title: string;
      seller: string;
      status: string;
      time: string;
      images?: string[];
      brand?: string;
      model?: string;
      year?: number;
      mileage?: number;
      color?: string;
      location?: string;
      description?: string;
      start_bid?: number;
      auction_duration?: number;
    }>;
  };
  notifications: {
    total: number;
    unread: number;
  };
  bidTrends: Array<{
    date: string;
    count: number;
  }>;
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [processingCarId, setProcessingCarId] = useState<number | null>(null);
  const [expandedCarId, setExpandedCarId] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: number]: number}>({});
  const [deleteConfirmCarId, setDeleteConfirmCarId] = useState<number | null>(null);

  useEffect(() => {
    checkAdminAndFetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAdminAndFetchData = async () => {
    try {
      // First check if user is logged in and is admin
      const meResponse = await axios.get('/auth/me/');
      const currentUsername = meResponse.data.username;
      setUsername(currentUsername);
      
      if (currentUsername !== 'admin') {
        setError('Access denied. Admin only.');
        setTimeout(() => navigate('/'), 2000);
        return;
      }
      
      // If admin, fetch dashboard data
      await fetchDashboardData();
    } catch (err: any) {
      console.error('Error checking admin:', err);
      setError('Authentication required');
      setTimeout(() => navigate('/'), 2000);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/admin/dashboard/');
      setData(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      if (err.response?.status === 403) {
        setError('Access denied. Admin only.');
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCar = async (carId: number) => {
    setProcessingCarId(carId);
    try {
      await axios.post(`/admin/cars/${carId}/approve/`);
      toast.success('تم قبول السيارة بنجاح');
      fetchDashboardData();
    } catch (error: any) {
      console.error('Error approving car:', error);
      toast.error(error.response?.data?.error || 'فشل قبول السيارة');
    } finally {
      setProcessingCarId(null);
    }
  };

  const handleRejectCar = async (carId: number) => {
    setProcessingCarId(carId);
    try {
      await axios.post(`/admin/cars/${carId}/reject/`);
      toast.success('تم رفض السيارة');
      fetchDashboardData();
    } catch (error: any) {
      console.error('Error rejecting car:', error);
      toast.error(error.response?.data?.error || 'فشل رفض السيارة');
    } finally {
      setProcessingCarId(null);
    }
  };

  const handleDeleteCar = async (carId: number) => {
    setProcessingCarId(carId);
    try {
      await axios.delete(`/admin/cars/${carId}/delete/`);
      toast.success('تم حذف السيارة بنجاح');
      setDeleteConfirmCarId(null);
      fetchDashboardData();
    } catch (error: any) {
      console.error('Error deleting car:', error);
      toast.error(error.response?.data?.error || 'فشل حذف السيارة');
    } finally {
      setProcessingCarId(null);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-red-900/20 border-red-500/50 text-white">
          <CardContent className="pt-6">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-center text-lg">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'CLOSED': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'IN_REVIEW': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'REJECTED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary via-accent to-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/50">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-cyan-400 mb-1">لوحة تحكم المدير</h1>
              <p className="text-slate-300">مراقبة شاملة لنشاط المنصة في الوقت الفعلي</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Clock className="w-4 h-4" />
            <span>آخر تحديث: الآن</span>
            <span className="mx-2">•</span>
            <span className="text-primary">مرحباً، {username}</span>
          </div>
        </div>

        {/* User Activity Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            نشاط المستخدمين
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all shadow-lg shadow-black/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-sm text-slate-300 mb-1">إجمالي المستخدمين</p>
                <p className="text-3xl font-bold text-slate-100">{data.userActivity.totalUsers}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all shadow-lg shadow-black/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-green-400" />
                  </div>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">7 أيام</Badge>
                </div>
                <p className="text-sm text-slate-300 mb-1">مستخدمون جدد</p>
                <p className="text-3xl font-bold text-slate-100">{data.userActivity.newUsers}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all shadow-lg shadow-black/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">30 يوم</Badge>
                </div>
                <p className="text-sm text-slate-300 mb-1">مستخدمون نشطون</p>
                <p className="text-3xl font-bold text-slate-100">{data.userActivity.activeUsers}</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all shadow-lg shadow-black/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-1">وصول المزايدة</p>
                <p className="text-3xl font-bold text-slate-100">{data.userActivity.usersWithAccess}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Auction Lifecycle & Bidding Volume */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Auction Lifecycle */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-xl shadow-black/50">
            <CardHeader>
              <CardTitle className="text-cyan-300 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                دورة حياة المزادات
              </CardTitle>
              <CardDescription className="text-slate-300">حالة السيارات والمزادات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-slate-200">إجمالي السيارات</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-100">{data.auctionLifecycle.totalCars}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-slate-200">مزادات نشطة</span>
                  </div>
                  <span className="text-2xl font-bold text-green-300">{data.auctionLifecycle.activeCars}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-gray-400" />
                    </div>
                    <span className="text-slate-200">مزادات مغلقة</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-400">{data.auctionLifecycle.closedCars}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-xs text-slate-300 mb-1">قيد المراجعة</p>
                    <p className="text-xl font-bold text-yellow-300">{data.auctionLifecycle.pendingCars}</p>
                  </div>
                  <div className="p-3 bg-slate-700/30 rounded-lg">
                    <p className="text-xs text-slate-300 mb-1">مرفوضة</p>
                    <p className="text-xl font-bold text-red-300">{data.auctionLifecycle.rejectedCars}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bidding Volume */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-xl shadow-black/50">
            <CardHeader>
              <CardTitle className="text-cyan-300 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-primary" />
                حجم المزايدة
              </CardTitle>
              <CardDescription className="text-slate-300">إحصائيات العروض والمزايدات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Gavel className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-slate-200">إجمالي المزايدات</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-100">{data.biddingVolume.totalBids}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-slate-200">مزايدات اليوم</span>
                  </div>
                  <span className="text-2xl font-bold text-green-300">{data.biddingVolume.bidsToday}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-slate-200">مزايدات الأسبوع</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-300">{data.biddingVolume.bidsThisWeek}</span>
                </div>

                {/* Revenue */}
                <div className="pt-3 border-t border-slate-700">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-slate-100 font-medium">إجمالي الإيرادات</span>
                    </div>
                    <span className="text-2xl font-bold text-slate-100">{data.revenue.totalRevenue.toLocaleString()} ر.س</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Bidders & Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Top Bidders */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-xl shadow-black/50">
            <CardHeader>
              <CardTitle className="text-cyan-300 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                أعلى المزايدين
              </CardTitle>
              <CardDescription className="text-slate-300">الأكثر نشاطاً في المزايدة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.biddingVolume.topBidders.map((bidder, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-100 font-medium truncate">{bidder.username}</p>
                      <p className="text-xs text-slate-300">{bidder.bidCount} مزايدة</p>
                    </div>
                    <p className="text-sm font-medium text-primary">{bidder.totalAmount.toLocaleString()} ر.س</p>
                  </div>
                ))}
                {data.biddingVolume.topBidders.length === 0 && (
                  <p className="text-center text-slate-500 py-4">لا يوجد مزايدون بعد</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-xl shadow-black/50">
            <CardHeader>
              <CardTitle className="text-cyan-300 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                مستخدمون جدد
              </CardTitle>
              <CardDescription className="text-slate-300">آخر التسجيلات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentActivity.recentUsers.map((user, index) => (
                  <div key={index} className="p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-slate-100 font-medium">{user.username}</p>
                      <span className="text-xs text-slate-300">منذ {user.joined}</span>
                    </div>
                    <p className="text-xs text-slate-300 truncate">{user.email}</p>
                  </div>
                ))}
                {data.recentActivity.recentUsers.length === 0 && (
                  <p className="text-center text-slate-500 py-4">لا يوجد مستخدمون جدد</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Bids */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-xl shadow-black/50">
            <CardHeader>
              <CardTitle className="text-cyan-300 flex items-center gap-2">
                <Gavel className="w-5 h-5 text-primary" />
                أحدث المزايدات
              </CardTitle>
              <CardDescription className="text-slate-300">آخر العروض المقدمة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {data.recentActivity.recentBids.map((bid, index) => (
                  <div key={index} className="p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-100 font-medium text-sm truncate">{bid.car}</p>
                        <p className="text-xs text-slate-300">{bid.user}</p>
                      </div>
                      <span className="text-xs text-slate-300 whitespace-nowrap mr-2">منذ {bid.time}</span>
                    </div>
                    <p className="text-sm font-medium text-primary">{bid.amount.toLocaleString()} ر.س</p>
                  </div>
                ))}
                {data.recentActivity.recentBids.length === 0 && (
                  <p className="text-center text-slate-500 py-4">لا توجد مزايدات بعد</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review Section */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm mt-6 shadow-xl shadow-black/50">
          <CardHeader>
            <CardTitle className="text-cyan-300 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              قسم المراجعات
            </CardTitle>
            <CardDescription className="text-slate-300">مراجعة والموافقة على السيارات المعلقة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.recentCars.filter(car => car.status === 'IN_REVIEW').length === 0 && (
                <p className="text-center text-slate-500 py-8">لا توجد سيارات في انتظار المراجعة</p>
              )}
              
              {data.recentActivity.recentCars.filter(car => car.status === 'IN_REVIEW').map((car, index) => (
                <Card key={index} className="bg-slate-700/30 border-slate-600/50 overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header Row */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
                      onClick={() => setExpandedCarId(expandedCarId === car.id ? null : car.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-slate-100 font-semibold text-lg">{car.title}</h3>
                            <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                              قيد المراجعة
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-300">
                            <span className="flex items-center gap-1">
                              <UserPlus className="w-4 h-4" />
                              بواسطة: {car.seller}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              منذ {car.time}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {expandedCarId === car.id ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedCarId === car.id && (
                      <div className="border-t border-slate-600/50 p-4 space-y-4 bg-slate-800/30">
                        {/* Car Images Carousel */}
                        {car.images && car.images.length > 0 && (
                          <div>
                            <h4 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-primary" />
                              صور السيارة ({car.images.length} صورة)
                            </h4>
                            <div className="relative bg-slate-900/50 rounded-lg overflow-hidden">
                              {/* Main Image - Full Size */}
                              <div className="relative">
                                <img 
                                  src={car.images[currentImageIndex[car.id] || 0]} 
                                  alt={`${car.title}`}
                                  className="w-full h-auto object-contain rounded-lg"
                                  style={{ maxHeight: '500px' }}
                                />
                                
                                {/* Image Counter - Page Number */}
                                <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg text-sm font-bold shadow-xl">
                                  <span className="text-slate-800">{(currentImageIndex[car.id] || 0) + 1}</span>
                                  <span className="text-slate-400 mx-1">/</span>
                                  <span className="text-slate-800">{car.images.length}</span>
                                </div>
                              </div>
                              
                              {/* Navigation Arrows - Only show if more than 1 image */}
                              {car.images.length > 1 && (
                                <>
                                  {/* Right Arrow - Next Image (Increase) */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const current = currentImageIndex[car.id] || 0;
                                      const newIndex = current === car.images.length - 1 ? 0 : current + 1;
                                      setCurrentImageIndex(prev => ({ ...prev, [car.id]: newIndex }));
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full transition-all shadow-lg"
                                  >
                                    <ChevronRight className="w-6 h-6" />
                                  </button>
                                  
                                  {/* Left Arrow - Previous Image (Decrease) */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const current = currentImageIndex[car.id] || 0;
                                      const newIndex = current === 0 ? car.images.length - 1 : current - 1;
                                      setCurrentImageIndex(prev => ({ ...prev, [car.id]: newIndex }));
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full transition-all shadow-lg"
                                  >
                                    <ChevronLeft className="w-6 h-6" />
                                  </button>
                                  
                                  {/* Image Counter Dots */}
                                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {car.images.map((_, idx) => (
                                      <div
                                        key={idx}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                          (currentImageIndex[car.id] || 0) === idx
                                            ? 'bg-white w-8'
                                            : 'bg-white/50'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Car Details Grid */}
                        <div>
                          <h4 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            تفاصيل السيارة
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {car.brand && (
                              <div className="bg-slate-700/50 p-3 rounded-lg">
                                <p className="text-xs text-slate-400 mb-1">الماركة</p>
                                <p className="text-slate-100">{car.brand}</p>
                              </div>
                            )}
                            {car.model && (
                              <div className="bg-slate-700/50 p-3 rounded-lg">
                                <p className="text-xs text-slate-400 mb-1">الموديل</p>
                                <p className="text-slate-100">{car.model}</p>
                              </div>
                            )}
                            {car.year && (
                              <div className="bg-slate-700/50 p-3 rounded-lg">
                                <p className="text-xs text-slate-400 mb-1">السنة</p>
                                <p className="text-slate-100">{car.year}</p>
                              </div>
                            )}
                            {car.body_type && (
                              <div className="bg-slate-700/50 p-3 rounded-lg">
                                <p className="text-xs text-slate-400 mb-1">نوع الهيكل</p>
                                <p className="text-slate-100">{car.body_type}</p>
                              </div>
                            )}
                            {car.mileage && (
                              <div className="bg-slate-700/50 p-3 rounded-lg">
                                <p className="text-xs text-slate-400 mb-1">المسافة المقطوعة</p>
                                <p className="text-slate-100">{car.mileage.toLocaleString()} كم</p>
                              </div>
                            )}
                            {car.fuel && (
                              <div className="bg-slate-700/50 p-3 rounded-lg">
                                <p className="text-xs text-slate-400 mb-1">نوع الوقود</p>
                                <p className="text-slate-100">{car.fuel}</p>
                              </div>
                            )}
                            {car.transmission && (
                              <div className="bg-slate-700/50 p-3 rounded-lg">
                                <p className="text-xs text-slate-400 mb-1">ناقل الحركة</p>
                                <p className="text-slate-100">{car.transmission}</p>
                              </div>
                            )}
                            {car.engine_size && (
                              <div className="bg-slate-700/50 p-3 rounded-lg">
                                <p className="text-xs text-slate-400 mb-1">سعة المحرك</p>
                                <p className="text-slate-100">{car.engine_size} لتر</p>
                              </div>
                            )}
                            {car.cylinders && (
                              <div className="bg-slate-700/50 p-3 rounded-lg">
                                <p className="text-xs text-slate-400 mb-1">عدد الأسطوانات</p>
                                <p className="text-slate-100">{car.cylinders}</p>
                              </div>
                            )}
                            {car.condition && (
                              <div className="bg-slate-700/50 p-3 rounded-lg">
                                <p className="text-xs text-slate-400 mb-1">الحالة العامة</p>
                                <p className="text-slate-100">{car.condition}</p>
                              </div>
                            )}
                            {car.accidents && (
                              <div className="bg-slate-700/50 p-3 rounded-lg">
                                <p className="text-xs text-slate-400 mb-1">الحوادث</p>
                                <p className="text-slate-100">
                                  {car.accidents === 'no' ? 'لا يوجد' : 
                                   car.accidents === 'minor' ? 'حوادث طفيفة' : 
                                   car.accidents === 'major' ? 'حوادث كبيرة' : car.accidents}
                                </p>
                              </div>
                            )}
                            {car.vin && (
                              <div className="bg-slate-700/50 p-3 rounded-lg">
                                <p className="text-xs text-slate-400 mb-1">رقم الهيكل (VIN)</p>
                                <p className="text-slate-100">{car.vin}</p>
                              </div>
                            )}
                            {car.color && (
                              <div className="bg-slate-700/50 p-3 rounded-lg">
                                <p className="text-xs text-slate-400 mb-1">اللون</p>
                                <p className="text-slate-100">{car.color}</p>
                              </div>
                            )}
                            {car.location && (
                              <div className="bg-slate-700/50 p-3 rounded-lg">
                                <p className="text-xs text-slate-400 mb-1">الموقع</p>
                                <p className="text-slate-100 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {car.location}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Auction Details */}
                        {car.start_bid && (
                          <div>
                            <h4 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
                              <Gavel className="w-4 h-4 text-primary" />
                              تفاصيل المزاد
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-slate-700/50 p-3 rounded-lg">
                                <p className="text-xs text-slate-400 mb-1">سعر البداية</p>
                                <p className="text-slate-100 font-semibold">{car.start_bid?.toLocaleString()} ر.س</p>
                              </div>
                              {car.auction_duration && (
                                <div className="bg-slate-700/50 p-3 rounded-lg">
                                  <p className="text-xs text-slate-400 mb-1">مدة المزاد</p>
                                  <p className="text-slate-100">
                                    {car.auction_duration === 1 ? 'دقيقة واحدة (تجريبي)' : 
                                     car.auction_duration === 3 ? '3 دقائق (تجريبي)' : 
                                     car.auction_duration === 360 ? '6 ساعات' : 
                                     `${car.auction_duration} دقيقة`}
                                  </p>
                                </div>
                              )}
                              {car.start_date && (
                                <div className="bg-slate-700/50 p-3 rounded-lg">
                                  <p className="text-xs text-slate-400 mb-1">تاريخ بدء المزاد</p>
                                  <p className="text-slate-100">
                                    {new Date(car.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    {' | '}
                                    {new Date(car.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        {car.description && (
                          <div>
                            <h4 className="text-slate-200 font-medium mb-2">الوصف</h4>
                            <p className="text-slate-300 text-sm bg-slate-700/50 p-3 rounded-lg">
                              {car.description}
                            </p>
                          </div>
                        )}

                        {/* Inspection Report */}
                        {car.inspection_report && (
                          <div>
                            <h4 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-primary" />
                              تقرير الفحص
                            </h4>
                            <a 
                              href={car.inspection_report} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 p-3 rounded-lg transition-colors text-slate-100"
                            >
                              <FileText className="w-5 h-5 text-green-400" />
                              <span>عرض تقرير الفحص</span>
                            </a>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={() => handleApproveCar(car.id)}
                            disabled={processingCarId === car.id}
                            size="lg"
                            variant="outline"
                            className="flex-1 border-green-500 text-green-500 hover:bg-green-500 hover:text-white hover:border-green-600 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 ml-2" />
                            قبول السيارة
                          </Button>
                          <Button
                            onClick={() => handleRejectCar(car.id)}
                            disabled={processingCarId === car.id}
                            size="lg"
                            variant="outline"
                            className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-600 transition-colors"
                          >
                            <XCircle className="w-4 h-4 ml-2" />
                            رفض السيارة
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {/* Non-Review Cars (Already Processed) */}
              {data.recentActivity.recentCars.filter(car => car.status !== 'IN_REVIEW').length > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-slate-300 text-lg font-semibold mb-4">آخر السيارات المعالجة</h3>
                  
                  {data.recentActivity.recentCars.filter(car => car.status !== 'IN_REVIEW').map((car, index) => (
                    <Card key={index} className="bg-slate-700/30 border-slate-600/50 overflow-hidden">
                      <CardContent className="p-0">
                        {/* Header Row */}
                        <div 
                          className="p-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
                          onClick={() => setExpandedCarId(expandedCarId === car.id ? null : car.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-slate-100 font-semibold text-lg">{car.title}</h3>
                                <Badge className={getStatusColor(car.status)}>{car.status}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-300">
                                <span className="flex items-center gap-1">
                                  <UserPlus className="w-4 h-4" />
                                  بواسطة: {car.seller}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  منذ {car.time}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {expandedCarId === car.id ? (
                                <ChevronUp className="w-5 h-5 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details - Same as pending review */}
                        {expandedCarId === car.id && (
                          <div className="border-t border-slate-600/50 p-4 space-y-4 bg-slate-800/30">
                            {/* Car Images Carousel - Same as above */}
                            {car.images && car.images.length > 0 && (
                              <div>
                                <h4 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
                                  <ImageIcon className="w-4 h-4 text-primary" />
                                  صور السيارة ({car.images.length} صورة)
                                </h4>
                                <div className="relative bg-slate-900/50 rounded-lg overflow-hidden">
                                  <div className="relative">
                                    <img 
                                      src={car.images[currentImageIndex[car.id] || 0]} 
                                      alt={`${car.title}`}
                                      className="w-full h-auto object-contain rounded-lg"
                                      style={{ maxHeight: '500px' }}
                                    />
                                    
                                    <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg text-sm font-bold shadow-xl">
                                      <span className="text-slate-800">{(currentImageIndex[car.id] || 0) + 1}</span>
                                      <span className="text-slate-400 mx-1">/</span>
                                      <span className="text-slate-800">{car.images.length}</span>
                                    </div>
                                  </div>
                                  
                                  {car.images.length > 1 && (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const current = currentImageIndex[car.id] || 0;
                                          const newIndex = current === car.images.length - 1 ? 0 : current + 1;
                                          setCurrentImageIndex(prev => ({ ...prev, [car.id]: newIndex }));
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full transition-all shadow-lg"
                                      >
                                        <ChevronRight className="w-6 h-6" />
                                      </button>
                                      
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const current = currentImageIndex[car.id] || 0;
                                          const newIndex = current === 0 ? car.images.length - 1 : current - 1;
                                          setCurrentImageIndex(prev => ({ ...prev, [car.id]: newIndex }));
                                        }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-3 rounded-full transition-all shadow-lg"
                                      >
                                        <ChevronLeft className="w-6 h-6" />
                                      </button>
                                      
                                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {car.images.map((_, idx) => (
                                          <div
                                            key={idx}
                                            className={`w-2 h-2 rounded-full transition-all ${
                                              (currentImageIndex[car.id] || 0) === idx
                                                ? 'bg-white w-8'
                                                : 'bg-white/50'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Car Details same as review section - copying structure */}
                            <div>
                              <h4 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                تفاصيل السيارة
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {car.brand && (
                                  <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">الماركة</p>
                                    <p className="text-slate-100">{car.brand}</p>
                                  </div>
                                )}
                                {car.model && (
                                  <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">الموديل</p>
                                    <p className="text-slate-100">{car.model}</p>
                                  </div>
                                )}
                                {car.year && (
                                  <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">السنة</p>
                                    <p className="text-slate-100">{car.year}</p>
                                  </div>
                                )}
                                {car.body_type && (
                                  <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">نوع الهيكل</p>
                                    <p className="text-slate-100">{car.body_type}</p>
                                  </div>
                                )}
                                {car.mileage && (
                                  <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">المسافة المقطوعة</p>
                                    <p className="text-slate-100">{car.mileage.toLocaleString()} كم</p>
                                  </div>
                                )}
                                {car.fuel && (
                                  <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">نوع الوقود</p>
                                    <p className="text-slate-100">{car.fuel}</p>
                                  </div>
                                )}
                                {car.transmission && (
                                  <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">ناقل الحركة</p>
                                    <p className="text-slate-100">{car.transmission}</p>
                                  </div>
                                )}
                                {car.engine_size && (
                                  <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">سعة المحرك</p>
                                    <p className="text-slate-100">{car.engine_size} لتر</p>
                                  </div>
                                )}
                                {car.cylinders && (
                                  <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">عدد الأسطوانات</p>
                                    <p className="text-slate-100">{car.cylinders}</p>
                                  </div>
                                )}
                                {car.condition && (
                                  <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">الحالة العامة</p>
                                    <p className="text-slate-100">{car.condition}</p>
                                  </div>
                                )}
                                {car.accidents && (
                                  <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">الحوادث</p>
                                    <p className="text-slate-100">
                                      {car.accidents === 'no' ? 'لا يوجد' : 
                                       car.accidents === 'minor' ? 'حوادث طفيفة' : 
                                       car.accidents === 'major' ? 'حوادث كبيرة' : car.accidents}
                                    </p>
                                  </div>
                                )}
                                {car.vin && (
                                  <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">رقم الهيكل (VIN)</p>
                                    <p className="text-slate-100">{car.vin}</p>
                                  </div>
                                )}
                                {car.color && (
                                  <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">اللون</p>
                                    <p className="text-slate-100">{car.color}</p>
                                  </div>
                                )}
                                {car.location && (
                                  <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">الموقع</p>
                                    <p className="text-slate-100 flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {car.location}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {car.start_bid && (
                              <div>
                                <h4 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
                                  <Gavel className="w-4 h-4 text-primary" />
                                  تفاصيل المزاد
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-400 mb-1">سعر البداية</p>
                                    <p className="text-slate-100 font-semibold">{car.start_bid?.toLocaleString()} ر.س</p>
                                  </div>
                                  {car.auction_duration && (
                                    <div className="bg-slate-700/50 p-3 rounded-lg">
                                      <p className="text-xs text-slate-400 mb-1">مدة المزاد</p>
                                      <p className="text-slate-100">
                                        {car.auction_duration === 1 ? 'دقيقة واحدة (تجريبي)' : 
                                         car.auction_duration === 3 ? '3 دقائق (تجريبي)' : 
                                         car.auction_duration === 360 ? '6 ساعات' : 
                                         `${car.auction_duration} دقيقة`}
                                      </p>
                                    </div>
                                  )}
                                  {car.start_date && (
                                    <div className="bg-slate-700/50 p-3 rounded-lg">
                                      <p className="text-xs text-slate-400 mb-1">تاريخ بدء المزاد</p>
                                      <p className="text-slate-100">
                                        {new Date(car.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        {' | '}
                                        {new Date(car.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {car.description && (
                              <div>
                                <h4 className="text-slate-200 font-medium mb-2">الوصف</h4>
                                <p className="text-slate-300 text-sm bg-slate-700/50 p-3 rounded-lg">
                                  {car.description}
                                </p>
                              </div>
                            )}

                            {/* Inspection Report */}
                            {car.inspection_report && (
                              <div>
                                <h4 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-primary" />
                                  تقرير الفحص
                                </h4>
                                <a 
                                  href={car.inspection_report} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 p-3 rounded-lg transition-colors text-slate-100"
                                >
                                  <FileText className="w-5 h-5 text-green-400" />
                                  <span>عرض تقرير الفحص</span>
                                </a>
                              </div>
                            )}

                            {/* Action Buttons - Conditional based on status */}
                            <div className="flex gap-3 pt-2">
                              {/* Show Accept button only if car is REJECTED */}
                              {car.status === 'REJECTED' && (
                                <Button
                                  onClick={() => handleApproveCar(car.id)}
                                  disabled={processingCarId === car.id}
                                  size="lg"
                                  variant="outline"
                                  className="flex-1 border-green-500 text-green-500 hover:bg-green-500 hover:text-white hover:border-green-600 transition-colors"
                                >
                                  <CheckCircle className="w-4 h-4 ml-2" />
                                  قبول
                                </Button>
                              )}
                              
                              {/* Show Reject button only if car is SOON or ACTIVE */}
                              {(car.status === 'SOON' || car.status === 'ACTIVE') && (
                                <Button
                                  onClick={() => handleRejectCar(car.id)}
                                  disabled={processingCarId === car.id}
                                  size="lg"
                                  variant="outline"
                                  className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-600 transition-colors"
                                >
                                  <XCircle className="w-4 h-4 ml-2" />
                                  رفض
                                </Button>
                              )}
                              
                              {/* Always show Delete button */}
                              <Button
                                onClick={() => setDeleteConfirmCarId(car.id)}
                                disabled={processingCarId === car.id}
                                size="lg"
                                variant="outline"
                                className="flex-1 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white hover:border-orange-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 ml-2" />
                                حذف
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirmCarId !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-orange-500/10 p-3 rounded-full">
                  <Trash2 className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">تأكيد الحذف</h3>
              <p className="text-slate-300 mb-6">
                هل أنت متأكد من حذف هذه السيارة؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setDeleteConfirmCarId(null)}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  disabled={processingCarId !== null}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={() => handleDeleteCar(deleteConfirmCarId)}
                  variant="outline"
                  className="flex-1 border-orange-500 bg-orange-500 text-white hover:bg-orange-600 hover:border-orange-600"
                  disabled={processingCarId !== null}
                >
                  {processingCarId === deleteConfirmCarId ? 'جاري الحذف...' : 'نعم، احذف'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
