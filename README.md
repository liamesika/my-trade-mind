# 🚀 TradeMind – יומן מסחר חכם מבוסס React & Firebase

ברוך הבא לפרויקט **TradeMind** – אפליקציה חכמה לניהול יומן מסחר עם תמיכה בשפות מרובות, ממשק מודרני, Firebase מאובטח והתאמה למובייל.

---

## 📁 מבנה הפרויקט

```
mytrademind/
├── public/                # קבצים סטטיים (index.html, favicon, תמונות וכו')
├── src/                   # קוד המקור של האפליקציה
│   ├── components/        # קומפוננטות לשימוש חוזר (מודלים, טפסים, כפתורים וכו')
│   ├── firebase/          # קבצים לחיבור ל־Firebase (auth, firestore, storage וכו')
│   ├── lang/              # קבצי תרגום לשפות (עברית/אנגלית)
│   ├── pages/             # מסכים של האפליקציה (Dashboard, Login, Home וכו')
│   ├── scripts/           # קבצי עזר – חישובים, עיבוד נתונים, לוגיקות
│   ├── styles/            # קבצי עיצוב Tailwind / CSS מותאמים אישית
│   ├── App.jsx            # קומפוננטת השורש של האפליקציה
│   └── index.js           # נקודת הכניסה לאפליקציה
├── .env                   # משתני סביבה (API Keys, Firebase וכו')
├── firebase.json          # קונפיגורציה של Firebase Hosting
├── .gitignore             # קבצים ש-Git לא יעקוב אחריהם
└── README.md              # קובץ ההסבר הזה
```

---

## 🧠 סקריפטים להרצה

בתוך תקיית הפרויקט, ניתן להריץ את הפקודות הבאות:

```bash
npm install
```

- מתקין את כל התלויות הדרושות מה־package.json

```bash
npm start
```

- מריץ את האפליקציה במצב פיתוח ב־http://localhost:3000

```bash
npm run build
```

- יוצר גרסת Production בתיקיית `build/`

```bash
npm test
```

- מריץ את הבדיקות (אם קיימות)

```bash
npm run eject
```

- (לא מומלץ למתחילים) חושף את הקונפיג המלא של React

---

## 🌐 דיפלוי ל־Firebase Hosting

1. התחברות:

```bash
firebase login
```

2. התחלת פרויקט (פעם ראשונה בלבד):

```bash
firebase init
```

- בחר: **Hosting**, **Functions** (אם יש), **Emulators** (אופציונלי)
- בחר בתיקייה `build` כ־public
- אשר SPA (Single Page App) כשנשאל

3. בנייה:

```bash
npm run build
```

4. פריסה:

```bash
firebase deploy
```

---

## 🔐 דוגמה לקובץ `.env`

```env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_RECAPTCHA_SITE_KEY=...
REACT_APP_FIREBASE_APPCHECK_DEBUG_TOKEN=true
```

> 📝 הערה: כל משתנה סביבה **חייב להתחיל ב־`REACT_APP_`** כדי ש־React תזהה אותו.

---

## 🛠 טכנולוגיות עיקריות

| טכנולוגיה         | שימוש |
|------------------|-------|
| **React**        | ממשק משתמש SPA |
| **React Router** | ניווט בין מסכים |
| **Firebase**     | Authentication, Firestore, Storage |
| **AppCheck**     | אבטחת גישה ל־API |
| **Tailwind CSS** | עיצוב מודרני |
| **i18n + JSON**  | תרגום דינמי לעברית ואנגלית |

---

## 📚 מקורות לימוד

- [React Docs](https://reactjs.org/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com/)

---