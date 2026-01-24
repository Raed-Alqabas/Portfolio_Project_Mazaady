import { useState } from "react";
import { useNavigate } from "react-router";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { login, register } from "../api/auth";
import { LogIn, UserPlus, Mail, Lock, User, Phone } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (user: { name: string; email: string }) => void;
}

export function AuthDialog({ open, onOpenChange, onLogin }: AuthDialogProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
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
          toast.error("البيانات المدخلة غير صحيحة!");
          setIsLoading(false);
          return;
        }

        const response = await login({
          username: formData.email,
          password: formData.password
        });

        onLogin({
          name: response.user.first_name || response.user.username,
          email: response.user.email,
        });

        Swal.fire({
          position: "top",
          icon: "success",
          title: " تم تسجيل الدخول بنجاح! حياك " + (response.user.first_name),
          showConfirmButton: false,
          timer: 3000
        });
        onOpenChange(false);
        resetForm();

        // Redirect to home and scroll to top
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Registration Validation
        if (!formData.firstName || !formData.lastName || !formData.username || !formData.email || !formData.password) {
          toast.error("يرجى ملء جميع الحقول المطلوبة");
          setIsLoading(false);
          return;
        }

        if (!validateEmail(formData.email)) {
          toast.error("البريد الإلكتروني غير صالح");
          setIsLoading(false);
          return;
        }

        if (formData.username.length < 3) {
          toast.error("اسم المستخدم يجب أن يكون 3 أحرف على الأقل");
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
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });

        onLogin({
          name: response.user.first_name || response.user.username,
          email: response.user.email,
        });

        Swal.fire({
          position: "top",
          icon: "success",
          title: "تم إنشاء الحساب بنجاح! مرحباً بك " + (response.user.first_name || response.user.username),
          showConfirmButton: false,
          timer: 3000
        });
        onOpenChange(false);
        resetForm();

        // Redirect to home and scroll to top
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error: any) {
      console.error("Auth error:", error);

      let msg = "حدث خطأ ما";
      let useSwal = false;

      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        msg = "لا يمكن الاتصال بالخادم. تأكد من تشغيل Django على المنفذ 8000";
      } else if (error.response?.data?.username) {
        msg = "هذا الاسم مستخدم بالفعل";
      } else if (error.response?.data?.email) {
        msg = "هذا البريد الإلكتروني مستخدم بالفعل";
      } else if (error.response?.data?.error) {
        msg = error.response.data.error;
        if (mode === "login") useSwal = true;
      } else if (error.response?.data?.detail) {
        msg = error.response.data.detail;
        if (mode === "login") useSwal = true;
      } else if (error.request) {
        msg = "لم يتم استلام رد من الخادم";
      }

      if (mode === "login" && useSwal) {
        Swal.fire({
          position: "top",
          icon: "error",
          title: "البيانات المدخله غير صحيحة!",
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      username: "",
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
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2">
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
          <DialogDescription className="text-center">
            {mode === "login"
              ? "أدخل بياناتك للوصول إلى حسابك"
              : "املأ البيانات التالية لإنشاء حساب جديد"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">الاسم الأول</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="الاسم الأول"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">الاسم الأخير</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="الاسم الأخير"
                      required
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم</Label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="اسم المستخدم"
                    required
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">
              {mode === "login" ? "اسم المستخدم أو البريد الإلكتروني" : "البريد الإلكتروني"}
            </Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="email"
                type="text"
                placeholder={mode === "login" ? "ادخل اسم المستخدم او البريد الإلكتروني" : "example@email.com"}
                required
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
                  required
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
                required
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
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full gap-2 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {mode === "login" ? "جاري تسجيل الدخول..." : "جاري إنشاء الحساب..."}
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
