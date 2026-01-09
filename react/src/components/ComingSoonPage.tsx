import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { ArrowLeft, Sparkles, Bell, Mail } from "lucide-react";

export function ComingSoonPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-6 rounded-full">
             <Bell className="w-16 h-16 text-primary animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">قريباً جداً</h1>
          <p className="text-gray-500 text-lg font-medium leading-relaxed">
            نحن نعمل بجهد لجلب هذه الميزة إليك. ترقبوا الإطلاق قريباً في حلته الجديدة!
          </p>
        </div>

        <div className="pt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="gap-3 rounded-xl px-8 py-6 border-gray-200 text-gray-600 font-bold hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للصفحة السابقة
          </Button>
        </div>
      </div>
    </div>
  );
}
