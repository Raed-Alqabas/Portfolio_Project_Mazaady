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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg text-center">
            يجب دفع عربون للمشاركة في المزايدة
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Amount Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-xs text-blue-700 mb-1">قيمة العربون المطلوب</p>
                <p className="text-2xl font-bold text-blue-900">1,500 ريال</p>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-900 font-semibold text-sm">ملاحظات هامة:</p>
            </div>
            <ul className="space-y-1.5 text-yellow-800 text-xs mr-6">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>العربون يخصم من قيمة المزاد في حال الفوز</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>يسترد العربون كاملاً في حال عدم الفوز</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>العربون غير قابل للاسترداد في حال الفوز وعدم الالتزام</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-3 pt-2 w-full">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            دفع 1,500 ريال
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
