import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { login, register } from "../api/auth";
import { LogIn, UserPlus, Mail, Lock, User, Phone } from "lucide-react";
import { toast } from "sonner";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (user: { name: string; email: string }) => void;
}

export function AuthDialog({ open, onOpenChange, onLogin }: AuthDialogProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isLoading) {
      console.log("Already processing, ignoring duplicate submission");
      return;
    }

    console.log("Form submitted", mode, formData);
    setIsLoading(true);

    try {
      if (mode === "login") {
        // Login Validation
        if (!formData.email || !formData.password) {
          toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
          setIsLoading(false);
          return;
        }

        const response = await login({
          username: formData.email,
          password: formData.password
        });

        onLogin({
          name: response.user.username,
          email: response.user.email,
        });

        toast.success("تم تسجيل الدخول بنجاح!");
        onOpenChange(false);
        resetForm();
      } else {
        // Registration Validation
        if (!formData.name || !formData.email || !formData.password) {
          toast.error("يرجى ملء جميع الحقول المطلوبة");
          setIsLoading(false);
          return;
        }

        if (!validateEmail(formData.email)) {
          toast.error("البريد الإلكتروني غير صالح");
          setIsLoading(false);
          return;
        }

        if (formData.name.length < 3) {
          toast.error("الاسم يجب أن يكون 3 أحرف على الأقل");
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
          setIsLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error("كلمة المرور غير متطابقة");
          setIsLoading(false);
          return;
        }

        const response = await register({
          username: formData.name,
          email: formData.email,
          password: formData.password
        });

        onLogin({
          name: response.user.username,
          email: response.user.email,
        });

        toast.success("تم إنشاء الحساب بنجاح! مرحباً بك " + response.user.username);
        onOpenChange(false);
        resetForm();
      }
    } catch (error: any) {
      console.error("Auth error:", error);

      let msg = "حدث خطأ ما";

      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        msg = "لا يمكن الاتصال بالخادم. تأكد من تشغيل Django على المنفذ 8000";
      } else if (error.response?.data?.username) {
        msg = "هذا الاسم مستخدم بالفعل";
      } else if (error.response?.data?.email) {
        msg = "هذا البريد الإلكتروني مستخدم بالفعل";
      } else if (error.response?.data?.error) {
        msg = error.response.data.error;
      } else if (error.response?.data?.detail) {
        msg = error.response.data.detail;
      } else if (error.request) {
        msg = "لم يتم استلام رد من الخادم";
      }

      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "login" ? (
              <>
                <LogIn className="w-5 h-5" />
                تسجيل الدخول
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                إنشاء حساب جديد
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "أدخل بياناتك للوصول إلى حسابك"
              : "املأ البيانات التالية لإنشاء حساب جديد"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="name"
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الجوال</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05xxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full gap-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {mode === "login" ? "جاري التسجيل..." : "جاري إنشاء الحساب..."}
              </>
            ) : mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                تسجيل الدخول
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                إنشاء حساب
              </>
            )}
          </Button>
        </form>

        <Separator />

        <div className="text-center">
          {mode === "login" ? (
            <p className="text-sm text-gray-600">
              ليس لديك حساب؟{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-blue-600 hover:underline"
              >
                إنشاء حساب جديد
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              لديك حساب بالفعل؟{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-blue-600 hover:underline"
              >
                تسجيل الدخول
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
