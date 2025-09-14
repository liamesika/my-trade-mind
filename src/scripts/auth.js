// src/scripts/auth.js
import { auth } from './firebase-init';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';

// Login
export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// Register
export async function registerWithEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
}

// Reset password
export function sendReset(email) {
  return sendPasswordResetEmail(auth, email);
}

// Logout
export function logout() {
  return signOut(auth);
}

// Auth state listener (helper)
export function listenToAuth(callback) {
  // returns unsubscribe
  return onAuthStateChanged(auth, callback);
}
