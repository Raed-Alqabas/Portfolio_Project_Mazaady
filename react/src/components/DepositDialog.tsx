import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { DollarSign, CreditCard, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";

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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    if (!paymentMethod) {
      toast.error("يرجى اختيار طريقة الدفع");
      return;
    }

    if (paymentMethod === "card") {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        toast.error("يرجى ملء جميع بيانات البطاقة");
        return;
      }
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("تم دفع العربون بنجاح! يمكنك الآن المزايدة");
      onDepositPaid();
      onOpenChange(false);
      resetForm();
    }, 2000);
  };

  const resetForm = () => {
    setPaymentMethod(null);
    setCardNumber("");
    setCardName("");
    setExpiryDate("");
    setCvv("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            دفع العربون للمزايدة
          </DialogTitle>
          <DialogDescription>
            يجب دفع عربون للمشاركة في المزايدة. العربون قابل للاسترداد
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Deposit Amount */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 mb-1">قيمة العربون المطلوب</p>
                  <p className="text-blue-900">{depositAmount.toLocaleString()} ريال</p>
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
                <p className="mb-2">ملاحظات هامة:</p>
                <ul className="list-disc mr-4 space-y-1">
                  <li>العربون يخصم من قيمة المزاد في حال الفوز</li>
                  <li>يسترد العربون كاملاً في حال عدم الفوز</li>
                  <li>العربون غير قابل للاسترداد في حال الفوز وعدم الالتزام</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Methods */}
          <div className="space-y-3">
            <Label>اختر طريقة الدفع</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod("card")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === "card"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <CreditCard className={`w-6 h-6 mx-auto mb-2 ${
                  paymentMethod === "card" ? "text-blue-600" : "text-gray-600"
                }`} />
                <p className="text-sm">بطاقة ائتمانية</p>
              </button>
              <button
                onClick={() => setPaymentMethod("bank")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === "bank"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <DollarSign className={`w-6 h-6 mx-auto mb-2 ${
                  paymentMethod === "bank" ? "text-blue-600" : "text-gray-600"
                }`} />
                <p className="text-sm">تحويل بنكي</p>
              </button>
            </div>
          </div>

          {/* Card Payment Form */}
          {paymentMethod === "card" && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">رقم البطاقة</Label>
                <Input
                  id="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardName">اسم حامل البطاقة</Label>
                <Input
                  id="cardName"
                  placeholder="الاسم كما يظهر على البطاقة"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">تاريخ الانتهاء</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="***"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    maxLength={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Info */}
          {paymentMethod === "bank" && (
            <div className="space-y-3 animate-in fade-in-50 duration-300">
              <Card>
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm text-gray-600">معلومات التحويل البنكي:</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">اسم البنك:</span>
                      <span>البنك الأهلي</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">رقم الحساب:</span>
                      <span className="font-mono">SA1234567890123456789</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">اسم الحساب:</span>
                      <span>منصة مزادي</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <p className="text-sm text-gray-600">
                بعد التحويل، يرجى إرسال صورة من إيصال التحويل لتفعيل إمكانية المزايدة
              </p>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handlePayment}
              disabled={!paymentMethod || isProcessing}
              className="flex-1 gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  دفع {depositAmount.toLocaleString()} ريال
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={isProcessing}
            >
              إلغاء
            </Button>
          </div>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>معاملة آمنة ومشفرة 100%</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
