import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

// התחברות אם לא התחבר כבר
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault() // או `cert` אם יש לך מפתח JSON
  });
}

const db = getFirestore();

export async function getUserProfile(userId) {
  try {
    const doc = await db.collection("users").doc(userId).get();
    if (!doc.exists) return null;

    return doc.data();
  } catch (error) {
    console.error("❌ שגיאה בשליפת פרטי משתמש:", error);
    return null;
  }
}
