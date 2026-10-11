# Navita Careers — نظام التوظيف

تطبيق تقديم على الوظائف بهوية نافيتا، ثنائي اللغة (عربي/إنجليزي) مع تبديل فوري،
قاعدة بيانات دائمة، لوحة موارد بشرية محمية، رفع سيرة ذاتية، وباركود للتقديم.

A bilingual (Arabic/English) job-application app in the Navita brand, with a
persistent database, a password-protected HR dashboard, CV upload and a branded
QR code.

---

## ما الذي يحتويه / What's inside

| المسار | الوصف |
| --- | --- |
| `/` | الصفحة الرئيسية — الأقسام والوظائف المتاحة وخطوات التقديم |
| `/apply` | شاشة الاختيار — وظيفة في نافيتا أو التقديم على ماجستير |
| `/apply/job` | نموذج التقديم على وظيفة (٤ خطوات) + رفع السي في |
| `/apply/masters` | نموذج التقديم على ماجستير (٤ خطوات) + رفع السي في/كشف الدرجات |
| `/apply/success` | تأكيد التقديم مع الرقم المرجعي |
| `/admin/login` | دخول الموارد البشرية (يوزر + باسورد) |
| `/admin` | قائمة الطلبات (المسارين) + إحصائيات + بحث وفلترة + تصدير Excel |
| `/admin/[id]` | تفاصيل الطلب + تغيير الحالة + ملاحظات + تحميل السي في |
| `/admin/qr` | باركود التقديم بهوية نافيتا — جاهز للطباعة والتحميل |

## الهوية / Brand

مأخوذة حرفياً من <https://navitabrand.netlify.app>:

| Token | Hex |
| --- | --- |
| Navy (أساسي) | `#1A3659` |
| Orange (مميّز) | `#EB692E` |
| Grey (مساند) | `#E7E8E9` |
| Ink | `#231F20` |
| Corner radius | `16px` |

الخطوط: **Cairo** للعربي، **Inter** للعناوين الإنجليزية، **Poppins** للنص الإنجليزي.

## قاعدة البيانات / Database

مشروع Supabase `bdm-sms`، في schema مستقل اسمه **`careers`** حتى لا يتداخل مع
جداول نظام الطلاب في `public`.

| الجدول | الوصف |
| --- | --- |
| `careers.department` | الأقسام (عربي/إنجليزي) |
| `careers.position` | الوظائف المتاحة لكل قسم |
| `careers.application` | الطلبات — المسارين معاً، مميّزين بعمود `application_type` |
| `careers.application_note` | ملاحظات الموارد البشرية وسجل تغيّر الحالة |
| `careers.admin_user` | حسابات الموارد البشرية (باسورد مشفّر bcrypt) |

الأرقام المرجعية بتفرّق بين المسارين: `NAV-2026-000123` للوظائف و`NVM-2026-000124` للماجستير.

ملفات السي في في bucket خاص **`careers-cv`** (غير عام، حد أقصى ٥ ميجابايت،
PDF/DOC/DOCX فقط). التحميل يتم عبر رابط موقّع صالح ٦٠ ثانية.

> RLS مفعّل ومقفول على كل جداول `careers`. التطبيق يتعامل مع القاعدة من
> السيرفر فقط بمفتاح `service_role`، والمفتاح لا يصل للمتصفح إطلاقاً.

## متغيرات البيئة / Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=https://veqcuykykoqyetnxpgjg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...      # سرّي — من Supabase > Project Settings > API
SESSION_SECRET=...                 # نص عشوائي طويل لتوقيع كوكي الجلسة
NEXT_PUBLIC_SITE_URL=https://...   # الرابط العام، يُستخدم لتوليد الباركود
```

## التشغيل محلياً / Local development

```bash
npm install
cp .env.example .env   # ثم املأ المفاتيح
npm run dev                  # http://localhost:3100
```

## إنشاء حساب موارد بشرية / Creating an HR account

```bash
npm run create-admin -- <username> <password> "<Full name>" [admin|hr|viewer]
```

الأدوار: `admin` و`hr` يقدران يغيّروا الحالة ويضيفوا ملاحظات، و`viewer` للقراءة فقط.

## النشر / Deployment

منشور على **Netlify**: <https://navita-careers.netlify.app>

> ⚠️ **أبقِ Next.js محدّثاً.** Netlify ترفض رفع دالة الخادم لأي إصدار Next عليه
> ثغرة أمنية معروفة، وتُظهر ذلك كـ `Build script returned non-zero exit code: 2`
> فقط — وهي رسالة مضللة تماماً. العلامة الفاصلة في بيانات النشر:
> `required_functions` ممتلئ بينما `available_functions` فارغ. السبب الحقيقي
> يظهر في سجل النشر وحده. الحل: `npm view next dist-tags` ثم الترقية إلى وسم
> `backport` (إصدار مُرقَّع من نفس الـ minor، بلا تغييرات كاسرة).

ارفع المتغيّرات الأربعة أعلاه في Site configuration → Environment variables.

يعمل على Vercel أيضاً بدون تعديل — استورد الريبو وأضف نفس المتغيّرات.
