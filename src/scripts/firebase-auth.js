// /public/scripts/firebase-auth.js

import { auth } from "./firebase-init.js";
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
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

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
