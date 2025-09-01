// /public/scripts/firebase-auth.js

import { auth , db } from "./firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut as fbSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  getIdToken
} from "firebase/auth";

import {
  // collection,
  // getDocs,
  // deleteDoc,
  doc,
//   getDoc,
  setDoc,
  // addDoc
} from 'firebase/firestore';

/**
 * מאזין לשינויי מצב התחברות של המשתמש
 * @param {Object} param0 - פונקציות callback
 * @param {Function} param0.onIn - מופעל כשהמשתמש מחובר
 * @param {Function} param0.onOut - מופעל כשהמשתמש מנותק
 */
export function watchAuthState({ onIn, onOut } = {}) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      onIn && onIn(user);
    } else {
      onOut && onOut();
    }
  });
}

/**
 * הרשמת משתמש חדש
 * @param {string} email
 * @param {string} password
 * @param {string} displayName
 * @returns {Promise<User>}
 */
export async function register(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
}

/**
 * התחברות עם אימייל וסיסמה
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/**
 * התחברות עם חשבון Google
 * @returns {Promise<User>}
 */
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

/**
 * איפוס סיסמה ושליחת מייל
 * @param {string} email
 * @returns {Promise<void>}
 */
export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

/**
 * התנתקות מהחשבון
 * @returns {Promise<void>}
 */
export function logout() {
  return fbSignOut(auth);
}

/**
 * המשתמש הנוכחי המחובר
 * @returns {User|null}
 */
export function currentUser() {
  return auth.currentUser;
}

/**
 * שליפת ID Token מהמשתמש
 * @param {boolean} forceRefresh
 * @returns {Promise<string|null>}
 */
export async function idToken(forceRefresh = false) {
  const user = auth.currentUser;
  return user ? getIdToken(user, forceRefresh) : null;
}



export async function saveUserProfile(userId, profileData) {
  try {
    // שמירה בתת-collection בשם onboarding, במסמך בשם userProfile
    const profileRef = doc(db, "users", userId, "onboarding", "userProfile");

    await setDoc(profileRef, {
      ...profileData,
      profileCompletedAt: new Date().toISOString()
    });

    console.log("✅ פרופיל היכרות נשמר בתת-קולקשן onboarding בהצלחה");
  } catch (error) {
    console.error("❌ שגיאה בשמירת פרופיל היכרות:", error);
    alert("שגיאה בשמירת הפרופיל. נסה שוב.");
  }
}


/** the problem is there are no variables mentorname and mentorimg
 * Save the selected mentor to the Firestore user document.
 * @param {string} userId - The UID of the user (from localStorage).
 * @param {string} mentorName - The custom name the user gave the mentor.
 * @param {string} mentorImg - The image URL of the selected mentor.
*/

export async function saveMentorToUser(userName,userId, mentorName, mentorImg, mentorType) {
  try {
    await setDoc(doc(db, "users", userName), {
      userId,
      mentorName,
      mentorImg,
      mentorType,
      mentorChosenAt: new Date().toISOString()
    }, { merge: true });
    console.log("✅ מנטור נשמר ב־Firebase");
  } catch (error) {
    console.error("שגיאה בשמירת מנטור:", error);
    alert("⚠️ שגיאה בשמירת המנטור. נסה שוב.");
  }
}

