import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>

        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-3xl">الشروط والأحكام</CardTitle>
            <p className="text-gray-600 mt-2">آخر تحديث: يناير 2025</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">1. المقدمة</h2>
              <p className="text-gray-700 leading-relaxed">
                مرحباً بك في منصة مزادي. باستخدامك لهذه المنصة، فإنك توافق على الالتزام بهذه الشروط والأحكام. 
                يرجى قراءة هذه الشروط بعناية قبل استخدام خدماتنا. إذا كنت لا توافق على أي من هذه الشروط، 
                يرجى عدم استخدام المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">2. التعريفات</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>المنصة:</strong> تشير إلى موقع مزادي الإلكتروني وجميع خدماته.</li>
                <li><strong>المستخدم:</strong> أي شخص يستخدم المنصة سواء كان بائعاً أو مشترياً.</li>
                <li><strong>المزاد:</strong> عملية بيع السيارات من خلال المزايدة العلنية على المنصة.</li>
                <li><strong>البائع:</strong> المستخدم الذي يعرض سيارته للبيع عبر المنصة.</li>
                <li><strong>المشتري:</strong> المستخدم الذي يشارك في المزايدة لشراء سيارة.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">3. التسجيل والحساب</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>3.1</strong> يجب أن يكون عمر المستخدم 18 عاماً على الأقل للتسجيل في المنصة.</p>
                <p><strong>3.2</strong> يجب تقديم معلومات صحيحة ودقيقة عند التسجيل.</p>
                <p><strong>3.3</strong> المستخدم مسؤول عن الحفاظ على سرية كلمة المرور الخاصة به.</p>
                <p><strong>3.4</strong> يحق للمنصة تعليق أو إنهاء أي حساب في حالة انتهاك الشروط.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">4. رسوم الاشتراك والمزايدة</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>4.1</strong> رسوم الوصول للمزايدة: 1,500 ريال سعودي (دفعة واحدة قابلة للاسترداد).</p>
                <p><strong>4.2</strong> هذه الرسوم تمنح المستخدم حق المزايدة على جميع المزادات في المنصة.</p>
                <p><strong>4.3</strong> جميع الرسوم المدفوعة غير قابلة للاسترداد ما لم ينص على خلاف ذلك.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">5. قواعد المزايدة</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>5.1</strong> جميع المزايدات ملزمة وغير قابلة للإلغاء.</p>
                <p><strong>5.2</strong> يجب على المزايد الالتزام بالدفع في حالة الفوز بالمزاد.</p>
                <p><strong>5.3</strong> يحق للمنصة إلغاء أي مزايدة مشبوهة أو مخالفة.</p>
                <p><strong>5.4</strong> مدة المزاد محددة ولا يمكن تمديدها إلا في حالات استثنائية.</p>
                <p><strong>5.5</strong> الفائز بالمزاد هو صاحب أعلى عرض عند انتهاء وقت المزاد.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">6. التزامات البائع</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>6.1</strong> يجب تقديم معلومات دقيقة وحقيقية عن السيارة.</p>
                <p><strong>6.2</strong> يجب الإفصاح عن أي عيوب أو أضرار في السيارة.</p>
                <p><strong>6.3</strong> يجب تقديم جميع الوثائق القانونية اللازمة.</p>
                <p><strong>6.4</strong> الالتزام بتسليم السيارة للمشتري الفائز بحالتها الموصوفة.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">7. التزامات المشتري</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>7.1</strong> الالتزام بالدفع الفوري عند الفوز بالمزاد.</p>
                <p><strong>7.2</strong> فحص السيارة قبل المزايدة أو قبول حالتها الموصوفة.</p>
                <p><strong>7.3</strong> استلام السيارة خلال المدة المحددة.</p>
                <p><strong>7.4</strong> تحمل تكاليف نقل الملكية والرسوم الحكومية.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">8. سياسة الاسترداد والإلغاء</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>8.1</strong> لا يمكن إلغاء المزايدة بعد تقديمها.</p>
                <p><strong>8.2</strong> في حالة عدم الالتزام بالدفع، يحق للمنصة اتخاذ إجراءات قانونية.</p>
                <p><strong>8.3</strong> رسوم الاشتراك غير قابلة للاسترداد تحت أي ظرف.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">9. إخلاء المسؤولية</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>9.1</strong> المنصة مجرد وسيط بين البائع والمشتري.</p>
                <p><strong>9.2</strong> لا تتحمل المنصة مسؤولية دقة المعلومات المقدمة من البائعين.</p>
                <p><strong>9.3</strong> لا تتحمل المنصة مسؤولية حالة السيارة الفعلية.</p>
                <p><strong>9.4</strong> المستخدم مسؤول عن إجراء الفحص الفني اللازم قبل المزايدة.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">10. حقوق الملكية الفكرية</h2>
              <p className="text-gray-700 leading-relaxed">
                جميع المحتويات والعلامات التجارية والشعارات الموجودة على المنصة هي ملك لمنصة مزادي. 
                يُحظر استخدام أي محتوى دون إذن كتابي مسبق.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">11. التعديلات على الشروط</h2>
              <p className="text-gray-700 leading-relaxed">
                تحتفظ المنصة بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم إخطار المستخدمين 
                بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على المنصة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">12. القانون الحاكم</h2>
              <p className="text-gray-700 leading-relaxed">
                تخضع هذه الشروط والأحكام لقوانين المملكة العربية السعودية. أي نزاع ينشأ عن استخدام 
                المنصة يخضع للاختصاص القضائي للمحاكم السعودية.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">13. التواصل</h2>
              <p className="text-gray-700 leading-relaxed">
                للاستفسارات أو الشكاوى، يرجى التواصل معنا عبر:
              </p>
              <ul className="list-none space-y-2 text-gray-700 mt-3">
                <li>البريد الإلكتروني: info@mazady.sa</li>
                <li>الهاتف: 920001234 966+</li>
                <li>ساعات العمل: الأحد - الخميس، 9 صباحاً - 5 مساءً</li>
              </ul>
            </section>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">
                بالمتابعة في استخدام منصة مزادي، فإنك تقر بأنك قد قرأت وفهمت ووافقت على جميع الشروط والأحكام المذكورة أعلاه.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
