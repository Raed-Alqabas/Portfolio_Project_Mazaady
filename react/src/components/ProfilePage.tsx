import { useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, Edit, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner";

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "مستخدم تجريبي",
    email: "user@example.com",
    phone: "0501234567",
    location: "الرياض",
    joinDate: "يناير 2024",
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    toast.success("تم تحديث الملف الشخصي بنجاح");
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const stats = [
    { label: "المزايدات النشطة", value: "2" },
    { label: "المزايدات المكتملة", value: "4" },
    { label: "الإعلانات النشطة", value: "3" },
    { label: "التقييم", value: "4.8/5" },
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
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="mb-2">{profile.name}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    عضو منذ {profile.joinDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
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
          {stats.map((stat, index) => (
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
              <div>
                <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  الاسم الكامل
                </Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editedProfile.name}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, name: e.target.value })
                    }
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{profile.name}</p>
                )}
              </div>

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
                    value={editedProfile.phone}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, phone: e.target.value })
                    }
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{profile.phone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="location" className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4" />
                  الموقع
                </Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={editedProfile.location}
                    onChange={(e) =>
                      setEditedProfile({ ...editedProfile, location: e.target.value })
                    }
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{profile.location}</p>
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
            <Button variant="outline" className="w-full">
              تغيير كلمة المرور
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
