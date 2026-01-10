import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function PrivacyPage() {
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
            <CardTitle className="text-3xl">سياسة الخصوصية</CardTitle>
            <p className="text-gray-600 mt-2">آخر تحديث: يناير 2025</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">1. المقدمة</h2>
              <p className="text-gray-700 leading-relaxed">
                نحن في منصة مزادي نلتزم بحماية خصوصيتك وأمان بياناتك الشخصية. توضح هذه السياسة 
                كيفية جمع واستخدام وحماية المعلومات التي نحصل عليها منك عند استخدام منصتنا.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">2. المعلومات التي نجمعها</h2>
              
              <h3 className="text-xl font-semibold mb-3 text-gray-800">2.1 المعلومات الشخصية</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>الاسم الكامل</li>
                <li>البريد الإلكتروني</li>
                <li>رقم الهاتف</li>
                <li>تاريخ الميلاد</li>
                <li>العنوان (إذا لزم الأمر)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-gray-800">2.2 معلومات المعاملات</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                <li>تفاصيل المزايدات والعروض</li>
                <li>معلومات الدفع (مشفرة)</li>
                <li>تاريخ المعاملات</li>
                <li>السيارات المفضلة والمحفوظة</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 text-gray-800">2.3 المعلومات التقنية</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>عنوان IP</li>
                <li>نوع المتصفح والجهاز</li>
                <li>ملفات تعريف الارتباط (Cookies)</li>
                <li>سجلات الاستخدام والأنشطة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">3. كيفية استخدام معلوماتك</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>3.1</strong> معالجة المزايدات والمعاملات المالية.</p>
                <p><strong>3.2</strong> التواصل معك بخصوص المزادات والإشعارات المهمة.</p>
                <p><strong>3.3</strong> تحسين وتطوير خدمات المنصة.</p>
                <p><strong>3.4</strong> منع الاحتيال والأنشطة المشبوهة.</p>
                <p><strong>3.5</strong> الامتثال للمتطلبات القانونية والتنظيمية.</p>
                <p><strong>3.6</strong> إرسال إشعارات تسويقية (بموافقتك فقط).</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">4. مشاركة المعلومات</h2>
              <p className="text-gray-700 mb-3">نحن لا نبيع معلوماتك الشخصية لأطراف ثالثة. ومع ذلك، قد نشارك معلوماتك مع:</p>
              
              <div className="space-y-3 text-gray-700">
                <p><strong>4.1 مقدمي الخدمات:</strong> شركات معالجة الدفع، خدمات الاستضافة، والدعم التقني.</p>
                <p><strong>4.2 الجهات القانونية:</strong> عند الطلب من السلطات المختصة أو الحاجة القانونية.</p>
                <p><strong>4.3 شركاء الأعمال:</strong> بموافقتك الصريحة فقط.</p>
                <p><strong>4.4 البائعين والمشترين:</strong> معلومات الاتصال الضرورية لإتمام المعاملة.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">5. حماية البيانات</h2>
              <p className="text-gray-700 mb-3">نتخذ إجراءات أمنية صارمة لحماية معلوماتك:</p>
              
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>تشفير البيانات باستخدام تقنية SSL/TLS</li>
                <li>خوادم آمنة محمية بجدران نارية</li>
                <li>الوصول المحدود للبيانات للموظفين المصرح لهم فقط</li>
                <li>مراجعات أمنية دورية واختبارات اختراق</li>
                <li>نسخ احتياطي منتظم للبيانات</li>
                <li>المصادقة الثنائية للحسابات الحساسة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">6. ملفات تعريف الارتباط (Cookies)</h2>
              <p className="text-gray-700 mb-3">نستخدم ملفات تعريف الارتباط لـ:</p>
              
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>تحسين تجربة المستخدم وتذكر تفضيلاتك</li>
                <li>تحليل حركة المرور وأنماط الاستخدام</li>
                <li>تخصيص المحتوى والإعلانات</li>
                <li>الحفاظ على أمان جلساتك</li>
              </ul>
              
              <p className="text-gray-700 mt-3">
                يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات المتصفح الخاص بك.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">7. حقوقك</h2>
              <p className="text-gray-700 mb-3">لديك الحق في:</p>
              
              <div className="space-y-3 text-gray-700">
                <p><strong>7.1 الوصول:</strong> طلب نسخة من بياناتك الشخصية المخزنة لدينا.</p>
                <p><strong>7.2 التصحيح:</strong> تحديث أو تصحيح معلوماتك غير الدقيقة.</p>
                <p><strong>7.3 الحذف:</strong> طلب حذف بياناتك (مع مراعاة الالتزامات القانونية).</p>
                <p><strong>7.4 التقييد:</strong> طلب تقييد معالجة بياناتك في حالات معينة.</p>
                <p><strong>7.5 الاعتراض:</strong> الاعتراض على معالجة بياناتك لأغراض معينة.</p>
                <p><strong>7.6 النقل:</strong> الحصول على بياناتك بتنسيق قابل للقراءة آلياً.</p>
                <p><strong>7.7 سحب الموافقة:</strong> سحب موافقتك على معالجة البيانات في أي وقت.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">8. الاحتفاظ بالبيانات</h2>
              <p className="text-gray-700 leading-relaxed">
                نحتفظ بمعلوماتك الشخصية طالما كان حسابك نشطاً أو حسب الحاجة لتقديم خدماتنا. 
                بعد حذف الحساب، قد نحتفظ ببعض المعلومات للامتثال للمتطلبات القانونية أو حل النزاعات 
                لمدة لا تزيد عن 7 سنوات.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">9. خصوصية الأطفال</h2>
              <p className="text-gray-700 leading-relaxed">
                منصتنا غير موجهة للأشخاص دون سن 18 عاماً. نحن لا نجمع عن قصد معلومات شخصية من الأطفال. 
                إذا علمنا أننا جمعنا بيانات من طفل دون موافقة الوالدين، سنحذف هذه المعلومات فوراً.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">10. التحديثات على السياسة</h2>
              <p className="text-gray-700 leading-relaxed">
                قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم إخطارك بأي تغييرات جوهرية عبر 
                البريد الإلكتروني أو إشعار بارز على المنصة. ننصحك بمراجعة هذه السياسة بشكل دوري.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">11. النقل الدولي للبيانات</h2>
              <p className="text-gray-700 leading-relaxed">
                قد يتم تخزين ومعالجة بياناتك في خوادم موجودة خارج المملكة العربية السعودية. 
                نضمن أن جميع عمليات النقل تتم وفقاً للمعايير الدولية لحماية البيانات وبموجب 
                اتفاقيات حماية البيانات المناسبة.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">12. التواصل معنا</h2>
              <p className="text-gray-700 mb-3">
                إذا كانت لديك أي أسئلة أو مخاوف بشأن سياسة الخصوصية أو معالجة بياناتك، يرجى التواصل معنا:
              </p>
              <ul className="list-none space-y-2 text-gray-700">
                <li><strong>البريد الإلكتروني:</strong> privacy@mazady.sa</li>
                <li><strong>الهاتف:</strong> 920001234 966+</li>
                <li><strong>العنوان البريدي:</strong> مزادي، الرياض، المملكة العربية السعودية</li>
                <li><strong>ساعات العمل:</strong> الأحد - الخميس، 9 صباحاً - 5 مساءً</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-blue-600">13. الامتثال القانوني</h2>
              <p className="text-gray-700 leading-relaxed">
                تلتزم منصة مزادي بقوانين حماية البيانات في المملكة العربية السعودية، بما في ذلك 
                نظام حماية البيانات الشخصية ولوائحه التنفيذية. كما نلتزم بأفضل الممارسات الدولية 
                في مجال حماية البيانات.
              </p>
            </section>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">
                باستخدامك لمنصة مزادي، فإنك توافق على جمع واستخدام معلوماتك وفقاً لسياسة الخصوصية هذه.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
