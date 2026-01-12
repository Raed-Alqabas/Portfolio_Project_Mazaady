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
  ArrowDown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import axios from "../api/axios";

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
      title: string;
      seller: string;
      status: string;
      time: string;
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

        {/* Recent Cars */}
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm mt-6 shadow-xl shadow-black/50">
          <CardHeader>
            <CardTitle className="text-cyan-300 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              أحدث السيارات
            </CardTitle>
            <CardDescription className="text-slate-300">آخر الإعلانات المضافة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {data.recentActivity.recentCars.map((car, index) => (
                <div key={index} className="p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getStatusColor(car.status)}>{car.status}</Badge>
                    <span className="text-xs text-slate-400">منذ {car.time}</span>
                  </div>
                  <p className="text-slate-100 font-medium text-sm mb-1 truncate">{car.title}</p>
                  <p className="text-xs text-slate-300">بواسطة {car.seller}</p>
                </div>
              ))}
              {data.recentActivity.recentCars.length === 0 && (
                <p className="text-center text-slate-500 py-4 col-span-full">لا توجد سيارات بعد</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
