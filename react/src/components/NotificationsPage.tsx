import { useState, useEffect } from "react";
import { Bell, Gavel, CreditCard, ShieldCheck, ChevronLeft, Trash2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Notification {
  id: number;
  type: 'bid' | 'payment' | 'system';
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'bid',
      title: 'مزايدة جديدة',
      message: 'تم تخطي مزايدتك على سيارة تويوتا كامري 2023. المزايدة الحالية هي 86,000 ريال.',
      time: 'قبل 5 دقائق',
      unread: true
    },
    {
      id: 2,
      type: 'payment',
      title: 'تأكيد الدفع',
      message: 'تم بنجاح دفع مبلغ التأمين (1,500 ريال). يمكنك الآن البدء في المزايدة.',
      time: 'قبل ساعتين',
      unread: false
    },
    {
      id: 3,
      type: 'system',
      title: 'توثيق الحساب',
      message: 'تم توثيق هويتك بنجاح. حسابك الآن مفعل بالكامل.',
      time: 'يوم أمس',
      unread: false
    }
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'bid': return <Gavel className="w-5 h-5 text-orange-500" />;
      case 'payment': return <CreditCard className="w-5 h-5 text-green-500" />;
      default: return <ShieldCheck className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">مركز التنبيهات</h1>
          <p className="text-gray-600">تابع تحديثات مزاداتك وحسابك أولاً بأول</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead} className="rounded-xl">
          تعيين الكل كمقروء
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`border-none shadow-sm transition-all hover:shadow-md cursor-pointer group ${
                notification.unread ? 'bg-white ring-1 ring-primary/10' : 'bg-gray-50/50'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    notification.unread ? 'bg-primary/10' : 'bg-white'
                  }`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-bold text-gray-900 truncate ${notification.unread ? 'text-primary' : ''}`}>
                          {notification.title}
                        </h4>
                        {notification.unread && (
                          <span className="w-2 h-2 bg-accent rounded-full"></span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{notification.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-primary group-hover:gap-2 transition-all">
                        عرض التفاصيل
                        <ChevronLeft className="w-3 h-3" />
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد تنبيهات</h3>
            <p className="text-gray-500">سنقوم بإخطارك هنا بأي تحديثات جديدة تخص نشاطك</p>
          </div>
        )}
      </div>
    </div>
  );
}
