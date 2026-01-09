
import { useEffect, useState } from "react";
import { Link } from "react-router";
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
import { getDashboardStats, DashboardData } from "../api/dashboard";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await getDashboardStats();
        setData(statsData);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading || !data) {
     return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { stats, recent_bids: recentBids, recent_activity: recentActivity } = data;

  const statItems = [
    {
      title: "مزايداتي النشطة",
      value: stats.active_bids.toString(),
      icon: Gavel,
      color: "blue",
      link: "/my-bids",
    },
    {
      title: "مزادات فزت بها",
      value: stats.won_auctions.toString(),
      icon: Award,
      color: "green",
      link: "/my-bids?filter=won",
    },
    {
      title: "المفضلة",
      value: stats.favorites.toString(),
      icon: Heart,
      color: "red",
      link: "/favorites",
    },
    {
      title: "إجمالي الإنفاق",
      value: `${stats.total_spending.toLocaleString()} ريال`,
      icon: DollarSign,
      color: "purple",
      link: "#",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">مزايدة نشطة</Badge>;
      case "outbid":
        return <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20">تم التفوق عليك</Badge>;
      case "won":
        return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">فائز</Badge>;
      case "ended":
         return <Badge className="bg-gray-500/10 text-gray-700 border-gray-500/20">منتهي</Badge>;
      default:
        return null;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "bid": return <Gavel className="w-5 h-5 text-blue-500" />;
      case "outbid": return <TrendingDown className="w-5 h-5 text-amber-500" />;
      case "favorite": return <Heart className="w-5 h-5 text-red-500" />;
      case "won": return <Award className="w-5 h-5 text-green-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };
    
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">لوحة التحكم</h1>
              <p className="text-gray-600 text-sm">نظرة عامة على نشاطك في المنصة</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statItems.map((stat, index) => (
            <Link to={stat.link} key={index}>
              <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
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
            <Card className="border-0 shadow-md h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>مزايداتي الأخيرة</CardTitle>
                    <CardDescription>آخر المزادات التي شاركت فيها</CardDescription>
                  </div>
                  <Link to="/my-bids">
                    <Button variant="outline" size="sm">عرض الكل</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {recentBids.length > 0 ? (
                    <div className="space-y-4">
                    {recentBids.map((bid) => (
                        <Link
                        to={`/auction/${bid.id}`}
                        key={bid.id}
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group border border-gray-100"
                        >
                        {/* Image */}
                        <div className="relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                             {bid.image && <img src={bid.image} alt={bid.title} className="w-full h-full object-cover" />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                            <h3 className="text-gray-900 font-medium line-clamp-1">{bid.title}</h3>
                            {getStatusBadge(bid.status)}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-500">مزايدتي:</span>
                                <span className="text-gray-900 font-medium mr-1">{bid.myBid.toLocaleString()} ريال</span>
                            </div>
                            <div>
                                <span className="text-gray-500">الحالية:</span>
                                <span className="text-gray-900 font-medium mr-1">{bid.currentBid.toLocaleString()} ريال</span>
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
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        لا توجد مزايدات حديثة
                    </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="border-0 shadow-md h-full">
              <CardHeader>
                <CardTitle>النشاط الأخير</CardTitle>
                <CardDescription>آخر الإجراءات التي قمت بها</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                    <div key={index} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 mb-1">{activity.message}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 text-right" dir="ltr">
                             {formatDistanceToNow(new Date(activity.time), { addSuffix: true, locale: ar })}
                          </p>
                          {activity.amount && (
                            <p className="text-xs font-medium text-primary">{activity.amount}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                        لا يوجد نشاط حديث
                    </div>
                  )}
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
