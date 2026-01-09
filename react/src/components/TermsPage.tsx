import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ShieldCheck, Gavel, Scale } from "lucide-react";

export function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">الشروط والأحكام</h1>
        <p className="text-gray-600">آخر تحديث: 7 يناير 2026</p>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-md overflow-hidden">
          <div className="h-2 bg-primary"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <ShieldCheck className="w-7 h-7 text-primary" />
              أهلاً بك في منصة مزادي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-700 leading-relaxed text-lg">
            <p>
              باستخدامك لمنصة مزادي، فإنك توافق على الالتزام بالشروط والأحكام التالية والموافقة عليها بالكامل. يرجى قراءتها بعناية قبل البدء في المزايدة أو استخدام خدماتنا.
            </p>

            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <Gavel className="w-5 h-5 text-accent" />
                1. شروط المزايدة
              </h3>
              <ul className="list-disc list-inside space-y-2 pr-4">
                <li>يجب أن يكون عمر المستخدم 18 عاماً فأكثر وبكامل الأهلية القانونية.</li>
                <li>يلتزم المزايد بدفع مبلغ التأمين المحدد قبل المشاركة في أي مزاد.</li>
                <li>يعتبر العطاء المقدم ملزماً قانوناً ولا يجوز التراجع عنه بعد تقديمه.</li>
                <li>يتم ترسية المزاد على صاحب أعلى عطاء عند انتهاء الوقت المحدد.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <Scale className="w-5 h-5 text-accent" />
                2. الرسوم والدفع
              </h3>
              <ul className="list-disc list-inside space-y-2 pr-4">
                <li>رسوم العضوية (1,500 ريال) غير مستردة وتمنح حق المزايدة على جميع السيارات.</li>
                <li>يتم دفع قيمة السيارات المشتراة من خلال القنوات المعتمدة خلال 48 ساعة.</li>
                <li>تطبق ضريبة القيمة المضافة وفقاً للأنظمة المعمول بها في المملكة العربية السعودية.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">3. إخلاء المسؤولية</h3>
              <p>
                يتم بيع السيارات "على حالتها الراهنة" بناءً على تقارير الفحص الفني المرفقة. تقع مسؤولية معاينة السيارة والتأكد من حالتها على المزايد قبل تقديم العطاء. المنصة لا تقدم ضمانات بعد ترسية المزاد ونقل الملكية.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
              <p className="font-bold mb-1">ملاحظة هامة:</p>
              تخضع هذه الاتفاقية وتفسر وفقاً للقوانين والأنظمة المعمول بها في المملكة العربية السعودية، وأي نزاع ينشأ عنها يتم حله أمام الجهات القضائية المختصة في الرياض.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
