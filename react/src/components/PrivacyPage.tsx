import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Lock, Eye, ShieldAlert } from "lucide-react";

export function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">سياسة الخصوصية</h1>
        <p className="text-gray-600">آخر تحديث: 7 يناير 2026</p>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <div className="h-2 bg-accent"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Lock className="w-7 h-7 text-accent" />
            حماية بياناتك هي أولويتنا
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 text-gray-700 leading-relaxed text-lg">
          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <Eye className="w-5 h-5 text-primary" />
              المعلومات التي نجمعها
            </h3>
            <p>
              نحن نجمع البيانات الضرورية فقط لتقديم خدمة مزادات آمنة وفعالة، بما في ذلك:
            </p>
            <ul className="list-disc list-inside space-y-2 pr-4">
              <li>المعلومات الشخصية (الاسم، البريد الإلكتروني، رقم الهاتف).</li>
              <li>بيانات الهوية الوطنية المعتمدة (لغرض توثيق الحساب).</li>
              <li>سجل المزايدات والمعاملات المالية التي تتم عبر المنصة.</li>
              <li>المعلومات التقنية مثل عنوان IP ونوع المتصفح لتحسين تجربة المستخدم.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
              <ShieldAlert className="w-5 h-5 text-primary" />
              كيفية استخدام البيانات
            </h3>
            <ul className="list-disc list-inside space-y-2 pr-4">
              <li>إدارة حسابك وتوثيق هويتك كمزايد معتمد.</li>
              <li>معالجة المدفوعات وتأكيد عمليات الشراء والترسية.</li>
              <li>تحسين خدمات المنصة وتطوير ميزات جديدة.</li>
              <li>التواصل معك بخصوص المزادات النشطة أو التحديثات الهامة.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">مشاركة المعلومات مع أطراف ثالثة</h3>
            <p>
              نحن لا نبيع بياناتك الشخصية لأي طرف. يتم مشاركة معلوماتك فقط مع الجهات الرسمية إذا تطلب القانون ذلك، أو مع مقدمي خدمات الدفع (مثل بوابة Tap) لمعالجة معاملاتك المالية، ومع البائعين فقط لإتمام إجراءات نقل ملكية السيارة بعد الفوز بالمزاد.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">الأمان</h3>
            <p>
              نطبق معايير أمنية صارمة وتقنيات تشفير متقدمة لحماية بياناتك من الوصول غير المصرح به أو التغيير أو الإفصاح. يتم تخزين جميع البيانات على خوادم آمنة داخل المملكة العربية السعودية لضمان السيادة الرقمية والامتثال للأنظمة.
            </p>
          </section>

          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-gray-900 mb-1">مسؤول حماية البيانات</p>
              <p className="text-sm text-gray-600">لأي استفسار يخص خصوصيتك، راسلنا على: privacy@mazady.sa</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
