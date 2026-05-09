# منصة المهندس التعليمية

تطبيق ويب تعليمي بالعربية يربط بين الطلاب والأساتذة. يضم لوحة طالب تعرض الدروس والمحاضرات والجدول والأسئلة، ولوحة أستاذ لرفع المحاضرات والإجابة عن الأسئلة.

> **المنصة بالإنكليزي**: Mohandes Educational Platform — Arabic-first RTL educational platform with FastAPI backend and React frontend.

---

## التقنيات / Stack

| الطبقة | التقنية |
|---|---|
| Backend | FastAPI + SQLAlchemy + SQLite + JWT (python-jose) + bcrypt |
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS (RTL) + React Router |
| الخطوط | Cairo + Tajawal من Google Fonts |
| Database | SQLite — مسار افتراضي `./app.db` (محلي) أو `/data/app.db` (إنتاج مع Volume) |

---

## بنية المستودع

```
mohandes-edu/
├── backend/             FastAPI service
│   ├── app/
│   │   ├── main.py      نقطة الدخول + lifespan + static SPA fallback
│   │   ├── auth.py      JWT + bcrypt
│   │   ├── database.py  SQLAlchemy engine/session
│   │   ├── models.py    User / Course / Lecture / Question / ScheduleItem / Enrollment / Notification
│   │   ├── schemas.py   Pydantic schemas
│   │   ├── seed.py      seed بيانات عربية افتراضية
│   │   └── routers/     auth / courses / lectures / questions / schedule / notifications / teachers / enrollments
│   ├── pyproject.toml   poetry dependencies
│   └── poetry.lock
└── frontend/            React + Vite SPA
    ├── src/
    │   ├── pages/       Home / Materials / Questions / Sessions / Profile / Login / Register / CourseDetail / Upload
    │   ├── components/  Header / SearchBar / FeaturedTeacherCard / CourseCard / ScheduleList / BottomNav / ...
    │   └── lib/         api.ts (typed API client) / auth.tsx (context)
    └── package.json
```

---

## التشغيل المحلي / Local Development

### 1) الباك-اند

```bash
cd backend
poetry install
poetry run fastapi dev app/main.py --host 0.0.0.0 --port 8000
```

- يُنشئ قاعدة البيانات تلقائيًا و"يبذر" بيانات العربية في أول إقلاع.
- التوثيق التفاعلي: http://localhost:8000/docs
- نقطة الفحص: http://localhost:8000/healthz

متغيرات البيئة (اختيارية):
- `DATABASE_URL` (افتراضيًا `sqlite:///./app.db`)
- `JWT_SECRET` (افتراضيًا قيمة dev — **غيّرها في الإنتاج**)

### 2) الفرونت-اند

```bash
cd frontend
npm install
npm run dev
```

- يعمل على http://localhost:5173
- إعدادات الـ API في `.env`:
  - `VITE_API_URL=http://localhost:8000` للتطوير المحلي
  - `VITE_API_URL=` (فارغ) للنشر من نفس origin الباك-اند

### 3) النشر بـ Origin واحد (الباك-اند يخدم ملفات الفرونت-اند)

```bash
# داخل frontend/
echo "VITE_API_URL=" > .env
npm run build
rm -rf ../backend/static && cp -r dist ../backend/static

# داخل backend/
poetry run fastapi run app/main.py --host 0.0.0.0 --port 8000
```

عند وجود مجلد `backend/static`، يخدم FastAPI الـ SPA + الـ API على نفس الـ Origin بلا حاجة لـ CORS.

---

## API Endpoints

| المسار | الوصف |
|---|---|
| `POST /api/auth/register` | تسجيل مستخدم جديد |
| `POST /api/auth/login` | تسجيل الدخول وإصدار JWT |
| `GET  /api/auth/me` | بيانات المستخدم الحالي |
| `GET  /api/courses` | قائمة الكورسات |
| `GET  /api/courses/{id}` | تفاصيل كورس |
| `POST /api/courses` | إنشاء كورس (أستاذ) |
| `GET  /api/lectures` | قائمة المحاضرات |
| `POST /api/lectures` | رفع محاضرة (أستاذ) |
| `GET  /api/questions` | قائمة الأسئلة |
| `POST /api/questions` | طرح سؤال (طالب) |
| `POST /api/questions/{id}/answer` | الإجابة (أستاذ) |
| `GET  /api/schedule` | قائمة الجلسات |
| `GET  /api/notifications` | إشعارات المستخدم |
| `POST /api/notifications/{id}/read` | تحديد كمقروء |
| `GET  /api/teachers` | قائمة الأساتذة |
| `GET  /api/enrollments/me` | كورسات الطالب |
| `POST /api/enrollments` | تسجيل في كورس |
| `GET  /api/stats` | إحصائيات المنصة |

---

## بيانات الدخول التجريبية

تنشأ تلقائيًا عند الإقلاع الأول:

| الدور | البريد | كلمة المرور |
|---|---|---|
| طالب | `student@mohandes.edu` | `password123` |
| أستاذ | `teacher@mohandes.edu` | `password123` |

كذلك يمكن استخدام أزرار "تجربة كطالب" / "تجربة كأستاذ" في صفحة تسجيل الدخول.

---

## Roadmap / تطوير لاحق محتمل

- [ ] رفع فيديوهات حقيقي بدل URL خام
- [ ] دفع وإشتراكات
- [ ] صلاحيات إدارة (admin)
- [ ] إشعارات Push/Email
- [ ] تطبيق موبايل (React Native)
