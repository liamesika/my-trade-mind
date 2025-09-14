// src/firebase/firebase-init.js  (או הנתיב אצלך)
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAZSkuEVZ4H8_7hVVfZZHJXllDdDyvxui0",
  authDomain: "mytrademind-e1451.firebaseapp.com",
  projectId: "mytrademind-e1451",
  // הוסיפי את זה אם יש Realtime Database:
  databaseURL: "https://mytrademind-e1451-default-rtdb.firebaseio.com",
  storageBucket: "mytrademind-e1451.firebasestorage.app",
  messagingSenderId: "190787907194",
  appId: "1:190787907194:web:bfb04581dbd46489e095c3",
  measurementId: "G-ZR2DKQNJH3" // לא חובה אם לא משתמשים באנליטיקס
};

// ודאי שאין init כפול (חשוב כשיש קבצים נפרדים/דפים שונים)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// שירותים — ייצוא יחיד לכל הפרויקט
export const auth = getAuth(app);
export const realtimeDb = getDatabase(app);       // אם את לא משתמשת ב-Realtime DB — אפשר להסיר
export const firestore = getFirestore(app);// אם אין Firestore — להסיר
export const storage = getStorage(app);

// שמירת סשן בדפדפן (רשות אבל מומלץ)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn('Failed to set auth persistence:', error);
});

// Analytics רק בדפדפן ותמיכה קיימת
export let analytics = null;
if (typeof window !== "undefined" && typeof document !== "undefined" && firebaseConfig.measurementId) {
  analyticsSupported().then((ok) => { if (ok) analytics = getAnalytics(app); });
}
export { firestore as db };

export default app;


console.log("✅ firebase-init loaded");
