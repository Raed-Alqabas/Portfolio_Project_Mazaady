import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Bell, ArrowRight, Check, CheckCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import axios from "../api/axios";
import { toast } from "sonner";

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

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
      'OUTBID': 'bg-orange-100 border-orange-300 text-orange-700',
      'AUCTION_ENDING': 'bg-yellow-100 border-yellow-300 text-yellow-700',
      'AUCTION_WON': 'bg-green-100 border-green-300 text-green-700',
      'NEW_BID': 'bg-blue-100 border-blue-300 text-blue-700',
      'AUCTION_ENDED': 'bg-gray-100 border-gray-300 text-gray-700',
      'PAYMENT_CONFIRMED': 'bg-green-100 border-green-300 text-green-700',
      'SYSTEM': 'bg-purple-100 border-purple-300 text-purple-700',
    };
    return colors[type] || 'bg-gray-100 border-gray-300 text-gray-700';
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
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>

        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl">الإشعارات</CardTitle>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
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
                  className="gap-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  وضع علامة مقروء على الكل
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">لا توجد إشعارات</p>
                <p className="text-sm mt-2">سنرسل إليك إشعارات عند حدوث أي تحديثات</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-5 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getNotificationColor(notification.type)}`}
                          >
                            {notification.title}
                          </Badge>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!notification.is_read && (
                          <Button
                            onClick={() => markAsRead(notification.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        {notification.link && (
                          <Link to={notification.link}>
                            <Button variant="outline" size="sm" className="h-8 px-3">
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
