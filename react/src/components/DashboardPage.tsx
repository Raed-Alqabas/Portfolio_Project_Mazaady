import { Link } from "react-router";
import { useState, useEffect } from "react";
import {
  Gavel,
  Heart,
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  DollarSign,
  Activity,
  Eye,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import axios from "../api/axios";
import { AdminDashboardPage } from "./AdminDashboardPage";

export function DashboardPage() {
  const [stats, setStats] = useState({
    activeBids: 0,
    wonAuctions: 0,
    favorites: 0,
    totalSpending: 0,
    walletBalance: 0
  });
  const [recentBids, setRecentBids] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  const checkUserAndFetchData = async () => {
    try {
      // Check current user
      const meResponse = await axios.get('/auth/me/');
      setUsername(meResponse.data.username);

      // If not admin, fetch regular dashboard data
      if (meResponse.data.username !== 'admin') {
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/dashboard/');
      const data = response.data;
      setStats(data.stats);
      setRecentBids(data.recentBids);
      setRecentActivity(data.recentActivity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // If admin user, render admin dashboard
  if (username === 'admin') {
    return <AdminDashboardPage />;
  }

  const statCards = [
    {
      title: "مزايداتي النشطة",
      value: stats.activeBids.toString(),
      change: "نشط",
      changeType: "neutral",
      icon: Gavel,
      color: "blue",
      link: "/my-bids",
    },
    {
      title: "مزادات فزت بها",
      value: stats.wonAuctions.toString(),
      change: "فوز",
      changeType: "increase",
      icon: Award,
      color: "green",
      link: "/my-bids?filter=won",
    },
    {
      title: "المفضلة",
      value: stats.favorites.toString(),
      change: "محفوظ",
      changeType: "neutral",
      icon: Heart,
      color: "red",
      link: "/favorites",
    },
    {
      title: "إجمالي الإنفاق",
      value: `${stats.totalSpending.toLocaleString()} ريال`,
      change: "مجموع",
      changeType: "neutral",
      icon: DollarSign,
      color: "purple",
      link: "#",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">
            مزايدة نشطة
          </Badge>
        );
      case "outbid":
        return (
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20">
            تم التفوق عليك
          </Badge>
        );
      case "won":
        return (
          <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
            فائز
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20">
            منتهي
          </Badge>
        );
      default:
        return null;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "bid":
        return <Gavel className="w-5 h-5 text-blue-500" />;
      case "outbid":
        return <TrendingDown className="w-5 h-5 text-amber-500" />;
      case "favorite":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "won":
        return <Award className="w-5 h-5 text-green-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header with Wallet */}
        <div className="mb-8 flex items-start justify-between gap-4">
          {/* Left Side - Dashboard Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">لوحة التحكم</h1>
              <p className="text-gray-600 text-sm">نظرة عامة على نشاطك في المنصة</p>
            </div>
          </div>

          {/* Right Side - Wallet Display */}
          <div className="flex-shrink-0">
            <div className="rounded-xl shadow-md bg-white border-0 min-w-[240px]">
              {/* Content */}
              <div className="px-6 py-3">
                <p className="text-gray-600 text-xs font-medium mb-1">رصيد المحفظة</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-gray-900 text-2xl font-bold">
                    {stats.walletBalance.toFixed(0)}
                  </span>
                  <span className="text-gray-700 text-sm font-semibold">ريال</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Link to={stat.link} key={index}>
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Bids */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>مزايداتي الأخيرة</CardTitle>
                    <CardDescription>آخر المزادات التي شاركت فيها</CardDescription>
                  </div>
                  <Link to="/my-bids">
                    <Button variant="outline" size="sm">
                      عرض الكل
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBids.length === 0 ? (
                    <div className="text-center py-12">
                      <Gavel className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-2">لا توجد مزايدات حتى الآن</p>
                      <Link to="/auctions">
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                          <Eye className="w-4 h-4" />
                          تصفح المزادات
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    recentBids.map((bid) => (
                      <Link
                        to={`/auction/${bid.id}`}
                        key={bid.id}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        {/* Image */}
                        <div className="relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={bid.image}
                            alt={bid.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-gray-900 font-medium line-clamp-1">
                              {bid.title}
                            </h3>
                            {getStatusBadge(bid.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">مزايدتي:</span>
                              <span className="text-gray-900 font-medium mr-1">
                                {bid.myBid.toLocaleString()} ريال
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">الحالية:</span>
                              <span className="text-gray-900 font-medium mr-1">
                                {bid.currentBid.toLocaleString()} ريال
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Time */}
                        <div className="text-left flex-shrink-0">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {bid.timeLeft}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}

                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>النشاط الأخير</CardTitle>
                <CardDescription>آخر الإجراءات التي قمت بها</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 mb-1">
                          {activity.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">{activity.time}</p>
                          {activity.amount && (
                            <p className="text-xs font-medium text-primary">
                              {activity.amount}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-md mt-6">
              <CardHeader>
                <CardTitle>إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link to="/auctions">
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <Eye className="w-4 h-4" />
                      تصفح المزادات النشطة
                    </Button>
                  </Link>
                  <Link to="/favorites">
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <Heart className="w-4 h-4" />
                      عرض المفضلة
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button className="w-full justify-start gap-2" variant="outline">
                      <Activity className="w-4 h-4" />
                      إعدادات الحساب
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
