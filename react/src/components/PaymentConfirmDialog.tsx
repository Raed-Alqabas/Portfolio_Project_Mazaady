import { Dialog, DialogContent,DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Shield, AlertCircle, CheckCircle } from "lucide-react";

interface PaymentConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function PaymentConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: PaymentConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            يجب دفع عربون للمشاركة في المزايدة. العربون قابل للاسترداد
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Amount Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm text-blue-700 mb-1">قيمة العربون المطلوب</p>
                <p className="text-3xl font-bold text-blue-900">1,500 ريال</p>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-900 font-semibold">ملاحظات هامة:</p>
            </div>
            <ul className="space-y-2 text-yellow-800 text-sm mr-7">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>العربون يخصم من قيمة المزاد في حال الفوز</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>يسترد العربون كاملاً في حال عدم الفوز</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-1">•</span>
                <span>العربون غير قابل للاسترداد في حال الفوز وعدم الالتزام</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-8"
          >
            إلغاء
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="px-8 bg-[#3f4e6b] hover:bg-[#2f3e5b] text-white gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            دفع 1,500 ريال
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
