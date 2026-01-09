import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { DollarSign, Shield, AlertCircle, ExternalLink, CreditCard } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import api from "../api/axios";
import { toast } from "sonner";

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDepositPaid: () => void;
  depositAmount?: number;
}

export function DepositDialog({ 
  open, 
  onOpenChange, 
  onDepositPaid,
  depositAmount = 1500 
}: DepositDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | null>("card");

  const handlePayment = async () => {
    console.log("handlePayment triggered with method:", paymentMethod);
    
    if (paymentMethod === "bank") {
      toast.info("يرجى اتباع تعليمات التحويل البنكي الموضحة أدناه");
      return;
    }

    setIsProcessing(true);
    try {
      const currentPath = window.location.pathname;
      console.log("Requesting payment URL for path:", currentPath);
      
      const response = await api.get(`/membership/pay/?next=${encodeURIComponent(currentPath)}`);
      
      if (response.data && response.data.url) {
        console.log("Redirecting to Tap:", response.data.url);
        window.location.href = response.data.url;
      } else {
        toast.error("لم يتم استلام رابط الدفع من الخادم");
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error("Payment Error:", error);
      if (error.response?.status === 401) {
         toast.error("يرجى تسجيل الدخول أولاً");
      } else if (error.response?.data) {
         const msg = typeof error.response.data === 'string' ? error.response.data : "حدث خطأ أثناء الاتصال بالخادم";
         toast.error(msg);
      } else {
         toast.error("فشل الاتصال بالخادم");
      }
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            تفعيل العضوية الموحدة (v2.0)
          </DialogTitle>
          <DialogDescription>
            دفع رسوم العضوية لمرة واحدة والمشاركة في جميع المزادات الحالية والمستقبلية.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Deposit Amount */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 mb-1">رسوم العضوية (لمرة واحدة)</p>
                  <p className="text-blue-900 font-bold text-xl">{depositAmount.toLocaleString()} ريال</p>
                </div>
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="mb-2 font-medium">ملاحظات هامة:</p>
                <ul className="list-disc mr-4 space-y-1 text-yellow-900">
                  <li><strong>عضوية صالحة لجميع المزادات في الموقع</strong></li>
                  <li>المبلغ يعتبر عربون مسترد في حال عدم الفوز بأي مزاد</li>
                  <li>يتم استرداد المبلغ يدوياً عبر التواصل مع الدعم الفني</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Methods */}
          <div className="space-y-3">
            <Label className="text-gray-700 font-bold">اختر طريقة الدفع</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`p-4 border-2 rounded-xl transition-all flex flex-col items-center gap-2 ${
                  paymentMethod === "card"
                    ? "border-blue-600 bg-blue-50 text-blue-900"
                    : "border-gray-100 hover:border-blue-200 text-gray-500"
                }`}
              >
                <CreditCard className={`w-6 h-6 ${paymentMethod === "card" ? "text-blue-600" : ""}`} />
                <span className="text-sm font-bold">بطاقة ائتمانية</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("bank")}
                className={`p-4 border-2 rounded-xl transition-all flex flex-col items-center gap-2 ${
                  paymentMethod === "bank"
                    ? "border-blue-600 bg-blue-50 text-blue-900"
                    : "border-gray-100 hover:border-blue-200 text-gray-500"
                }`}
              >
                <DollarSign className={`w-6 h-6 ${paymentMethod === "bank" ? "text-blue-600" : ""}`} />
                <span className="text-sm font-bold">تحويل بنكي</span>
              </button>
            </div>
          </div>

          {/* Card Info Display */}
          {paymentMethod === "card" && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 animate-in fade-in duration-300">
              <div className="flex gap-3 mb-2">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm text-gray-700 font-bold uppercase tracking-wide text-blue-600">Tap Payment Gateway</p>
                  <p className="text-sm text-gray-700">سيتم تحويلك إلى بوابة دفع Tap الآمنة لإتمام عملية الدفع ببطاقتك الائتمانية.</p>
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Info */}
          {paymentMethod === "bank" && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <Card className="border-gray-100">
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm text-gray-600 font-bold mb-3">معلومات التحويل البنكي:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">اسم البنك:</span>
                      <span className="font-bold">البنك الأهلي</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">رقم الحساب:</span>
                      <span className="font-mono font-bold">SA1234567890123456789</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">اسم الحساب:</span>
                      <span className="font-bold">منصة مزادي</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handlePayment}
              disabled={isProcessing || !paymentMethod}
              className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 py-6 rounded-xl text-lg font-bold shadow-lg shadow-blue-200"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري التحويل...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  دفع {depositAmount.toLocaleString()} ريال
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
              className="py-6 rounded-xl font-bold px-8 border-gray-100"
            >
              إلغاء
            </Button>
          </div>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Shield className="w-3.5 h-3.5" />
            <span>بوابة دفع آمنة ومشفرة 100%</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
