import { useState, useEffect } from "react";
import { User, Mail, Phone, Calendar, Edit, Save, Lock, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner";
import axios from "../api/axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Profile Data
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    joinDate: "",
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  // Stats Data
  const [stats, setStats] = useState({
    activeBids: 0,
    wonAuctions: 0,
    activeAds: 0,
    walletBalance: 0,
    rating: null as number | null
  });

  // Password Change State
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      // Fetch User Info
      const userRes = await axios.get('/auth/me/');
      const userData = userRes.data;
      
      // Format date
      const date = new Date(userData.date_joined || Date.now());
      const formattedDate = new Intl.DateTimeFormat('ar-SA', { month: 'long', year: 'numeric' }).format(date);
      
      setProfile({
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        phone: userData.phone || "",
        joinDate: formattedDate,
      });
      setEditedProfile({
         username: userData.username,
        email: userData.email,
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        phone: userData.phone || "",
        joinDate: formattedDate,
      });

      // Fetch Stats
      const statsRes = await axios.get('/dashboard/');
      setStats({
        activeBids: statsRes.data.stats.activeBids,
        wonAuctions: statsRes.data.stats.wonAuctions,
        activeAds: statsRes.data.stats.activeAds || 0,
        walletBalance: statsRes.data.stats.walletBalance || 0,
        rating: statsRes.data.stats.rating
      });

    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("فشل تحميل بيانات الملف الشخصي");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.post('/auth/update-profile/', {
        first_name: editedProfile.first_name,
        last_name: editedProfile.last_name,
        phone: editedProfile.phone
      });
      
      setProfile(editedProfile);
      setIsEditing(false);
      toast.success("تم تحديث الملف الشخصي بنجاح");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("فشل تحديث البيانات");
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleChangePassword = async () => {
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    
    if (passwords.new_password.length < 8) {
        toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
        return;
    }

    try {
      await axios.post('/auth/change-password/', {
        old_password: passwords.old_password,
        new_password: passwords.new_password
      });
      toast.success("تم تغيير كلمة المرور بنجاح");
      setPasswordOpen(false);
      setPasswords({ old_password: "", new_password: "", confirm_password: "" });
    } catch (error: any) {
        const msg = error.response?.data?.error || "فشل تغيير كلمة المرور";
      toast.error(msg);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold">الملف الشخصي</h1>
          <p className="text-gray-600">إدارة معلومات حسابك الشخصي</p>
        </div>

        {/* Profile Header */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                <AvatarFallback className="bg-blue-600 text-white text-3xl font-bold">
                  {profile.first_name ? profile.first_name.charAt(0) : profile.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                    {profile.first_name} {profile.last_name}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    عضو منذ {profile.joinDate}
                  </div>
                  {/* Location removed */}
                </div>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                  <Edit className="w-4 h-4" />
                  تعديل الملف
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>المعلومات الشخصية</CardTitle>
            <CardDescription>معلومات حسابك وبيانات الاتصال</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                {/* First Name */}
              <div>
                <Label htmlFor="first_name" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  الاسم الأول
                </Label>
                {isEditing ? (
                  <Input
                    id="first_name"
                    value={editedProfile.first_name}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, first_name: e.target.value })
                    }
                  />
                ) : (
                  <p className="p-3 bg-gray-50 rounded-md border border-gray-100">{profile.first_name}</p>
                )}
              </div>

                {/* Last Name */}
              <div>
                <Label htmlFor="last_name" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  الاسم الأخير
                </Label>
                {isEditing ? (
                  <Input
                    id="last_name"
                    value={editedProfile.last_name}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, last_name: e.target.value })
                    }
                  />
                ) : (
                  <p className="p-3 bg-gray-50 rounded-md border border-gray-100">{profile.last_name}</p>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
                <Label htmlFor="username" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  اسم المستخدم
                </Label>
                 <p className="p-3 bg-gray-50 rounded-md border border-gray-100 text-gray-500">
                    @{profile.username}
                 </p>
                 <p className="text-xs text-gray-400 mt-1">لا يمكن تغيير اسم المستخدم</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4" />
                  البريد الإلكتروني
                </Label>
                 <p className="p-3 bg-gray-50 rounded-md border border-gray-100 text-gray-500">{profile.email}</p>
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
                    value={editedProfile.phone}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, phone: e.target.value })
                    }
                  />
                ) : (
                  <p className="p-3 bg-gray-50 rounded-md border border-gray-100">{profile.phone || "غير محدد"}</p>
                )}
              </div>
              
              {/* Location REMOVED */}
            </div>

            {isEditing && (
              <>
                <Separator />
                <div className="flex gap-2 justify-end">
                   <Button variant="outline" onClick={handleCancel}>
                    إلغاء
                  </Button>
                  <Button onClick={handleSave} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4" />
                    حفظ التغييرات
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="mt-6 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>الأمان</CardTitle>
            <CardDescription>إعدادات الحساب والأمان</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-between group hover:border-blue-500 hover:text-blue-600">
                        <span className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            تغيير كلمة المرور
                        </span>
                        <Edit className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تغيير كلمة المرور</DialogTitle>
                        <DialogDescription>
                            أدخل كلمة المرور الحالية وكلمة المرور الجديدة.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>كلمة المرور الحالية</Label>
                            <Input 
                                type="password" 
                                value={passwords.old_password}
                                onChange={(e) => setPasswords({...passwords, old_password: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>كلمة المرور الجديدة</Label>
                            <Input 
                                type="password" 
                                value={passwords.new_password}
                                onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>تأكيد كلمة المرور الجديدة</Label>
                            <Input 
                                type="password" 
                                value={passwords.confirm_password}
                                onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordOpen(false)}>إلغاء</Button>
                        <Button onClick={handleChangePassword}>حفظ كلمة المرور</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
