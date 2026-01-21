import { useState, useEffect } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import { Bell, ArrowRight, Check, CheckCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import axios from "../api/axios";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const { user }: any = useOutletContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !localStorage.getItem('access')) {
      Swal.fire({
        icon: 'warning',
        title: 'يجب تسجيل الدخول',
        text: 'يرجى تسجيل الدخول للوصول إلى الإشعارات',
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#1e3a5f'
      }).then(() => {
        navigate('/');
      });
      return;
    }
    fetchNotifications();
  }, [user, navigate]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications/');
      setNotifications(res.data.notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("فشل تحميل الإشعارات");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await axios.post(`/notifications/${notificationId}/read/`);
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("فشل تحديث الإشعار");
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post('/notifications/mark-all-read/');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success("تم وضع علامة مقروء على جميع الإشعارات");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("فشل تحديث الإشعارات");
    }
  };

  const getNotificationColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'OUTBID': 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-400 text-orange-700',
      'AUCTION_ENDING': 'bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-400 text-yellow-700',
      'AUCTION_WON': 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-500 text-green-700',
      'NEW_BID': 'bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-400 text-blue-700',
      'AUCTION_ENDED': 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-400 text-gray-700',
      'PAYMENT_CONFIRMED': 'bg-gradient-to-r from-green-100 to-teal-100 border-green-500 text-green-700',
      'SYSTEM': 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-400 text-purple-700',
    };
    return colors[type] || 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-400 text-gray-700';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;

    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12" dir="rtl">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors font-medium"
        >
          <ArrowRight className="w-5 h-5" />
          العودة للرئيسية
        </Link>

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-blue-600 bg-blue-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl text-white font-bold drop-shadow-md">الإشعارات</CardTitle>
                  {unreadCount > 0 && (
                    <p className="text-sm text-white/95 mt-1 font-medium drop-shadow">
                      لديك {unreadCount} إشعار غير مقروء
                    </p>
                  )}
                </div>
              </div>
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-white/90 backdrop-blur-sm border-white text-blue-600 hover:bg-white font-medium"
                >
                  <CheckCheck className="w-4 h-4" />
                  وضع علامة مقروء على الكل
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <Bell className="w-12 h-12 text-blue-400" />
                </div>
                <p className="text-xl font-bold text-gray-700 mb-2">لا توجد إشعارات</p>
                <p className="text-sm text-gray-500">سنرسل إليك إشعارات عند حدوث أي تحديثات</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 ${!notification.is_read ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-l-4 border-blue-500' : ''
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge
                            variant="outline"
                            className={`text-sm font-bold px-3 py-1 ${getNotificationColor(notification.type)}`}
                          >
                            {notification.title}
                          </Badge>
                          {!notification.is_read && (
                            <div className="relative">
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                              <div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-800 leading-relaxed mb-3 text-lg">
                          {notification.message}
                        </p>
                        <p className="text-sm text-gray-500 font-medium">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!notification.is_read && (
                          <Button
                            onClick={() => markAsRead(notification.id)}
                            variant="ghost"
                            size="sm"
                            className="h-10 px-4 bg-green-50 hover:bg-green-100 text-green-600 font-medium"
                          >
                            <Check className="w-5 h-5" />
                          </Button>
                        )}
                        {notification.link && (
                          <Link to={notification.link}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-10 px-4 bg-blue-50 hover:bg-blue-700 hover:text-white text-blue-600 border-blue-200 font-medium"
                            >
                              عرض
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
