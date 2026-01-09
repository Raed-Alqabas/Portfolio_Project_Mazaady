import { useState, useEffect } from "react";
import { User, Mail, Phone, Calendar, Edit, Save, Lock, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { toast } from "sonner";
import { getProfile, updateProfile, changePassword, getUserStats, ProfileData, UserStats } from "../api/profile";

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<UserStats>({
    active_bids: 0,
    completed_bids: 0,
    active_listings: 0,
    rating: 0,
  });

  const [editedProfile, setEditedProfile] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    fetchProfileData();
    fetchStats();
  }, []);

  const fetchProfileData = async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      setEditedProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        email: data.email,
        phone: data.phone,
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 401) {
        toast.error("يرجى تسجيل الدخول أولاً");
      } else {
        toast.error("حدث خطأ في تحميل البيانات");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getUserStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSave = async () => {
    try {
      const updatedProfile = await updateProfile(editedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success("تم تحديث الملف الشخصي بنجاح");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("حدث خطأ في تحديث البيانات");
      }
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditedProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        username: profile.username,
        email: profile.email,
        phone: profile.phone,
      });
    }
    setIsEditing(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }

    try {
      await changePassword(passwordData);
      toast.success("تم تغيير كلمة المرور بنجاح");
      setIsPasswordDialogOpen(false);
      setPasswordData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("حدث خطأ في تغيير كلمة المرور");
      }
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    const arabicMonths = [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    return `${arabicMonths[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "؟";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <p className="text-gray-600">حدث خطأ في تحميل البيانات</p>
      </div>
    );
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim() || profile.username;

  const statsDisplay = [
    { label: "المزايدات النشطة", value: stats.active_bids.toString() },
    { label: "المزايدات المكتملة", value: stats.completed_bids.toString() },
    { label: "الإعلانات النشطة", value: stats.active_listings.toString() },
    { label: "التقييم", value: stats.rating > 0 ? `${stats.rating}/5` : "لا يوجد" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2">الملف الشخصي</h1>
          <p className="text-gray-600">إدارة معلومات حسابك الشخصي</p>
        </div>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-blue-600 text-white text-2xl">
                  {getInitial(profile.first_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="mb-2">{fullName}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    عضو منذ {formatJoinDate(profile.date_joined)}
                  </div>
                </div>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} className="gap-2">
                  <Edit className="w-4 h-4" />
                  تعديل الملف
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {statsDisplay.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <p className="text-2xl text-blue-600 mb-2">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Profile Details */}
        <Card>
          <CardHeader>
            <CardTitle>المعلومات الشخصية</CardTitle>
            <CardDescription>معلومات حسابك وبيانات الاتصال</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4" />
                        الاسم الأول
                      </Label>
                      <Input
                        id="firstName"
                        value={editedProfile.first_name}
                        onChange={(e) =>
                          setEditedProfile({ ...editedProfile, first_name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4" />
                        الاسم الأخير
                      </Label>
                      <Input
                        id="lastName"
                        value={editedProfile.last_name}
                        onChange={(e) =>
                          setEditedProfile({ ...editedProfile, last_name: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="username" className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      اسم المستخدم
                    </Label>
                    <Input
                      id="username"
                      value={editedProfile.username}
                      onChange={(e) =>
                        setEditedProfile({ ...editedProfile, username: e.target.value })
                      }
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4" />
                        الاسم الأول
                      </Label>
                      <p className="p-2 bg-gray-50 rounded">{profile.first_name || "غير محدد"}</p>
                    </div>
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4" />
                        الاسم الأخير
                      </Label>
                      <p className="p-2 bg-gray-50 rounded">{profile.last_name || "غير محدد"}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      اسم المستخدم
                    </Label>
                    <p className="p-2 bg-gray-50 rounded">{profile.username}</p>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4" />
                  البريد الإلكتروني
                </Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, email: e.target.value })
                    }
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{profile.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4" />
                  رقم الجوال
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    dir="ltr"
                    className="text-right"
                    value={editedProfile.phone}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, phone: e.target.value })
                    }
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{profile.phone || "غير محدد"}</p>
                )}
              </div>
            </div>

            {isEditing && (
              <>
                <Separator />
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="w-4 h-4" />
                    حفظ التغييرات
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    إلغاء
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>الأمان</CardTitle>
            <CardDescription>إعدادات الحساب والأمان</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setIsPasswordDialogOpen(true)}
            >
              <Lock className="w-4 h-4" />
              تغيير كلمة المرور
            </Button>
          </CardContent>
        </Card>

        {/* Password Change Dialog */}
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                تغيير كلمة المرور
              </DialogTitle>
              <DialogDescription>
                أدخل كلمة المرور الحالية والجديدة
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">كلمة المرور الحالية</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={passwordData.old_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, old_password: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, new_password: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirm_password: e.target.value })
                  }
                  required
                />
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button type="submit" className="flex-1 gap-2">
                  <Lock className="w-4 h-4" />
                  تغيير كلمة المرور
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsPasswordDialogOpen(false);
                    setPasswordData({
                      old_password: "",
                      new_password: "",
                      confirm_password: "",
                    });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
