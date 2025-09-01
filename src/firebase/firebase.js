// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyA20gVGMT4SgU5dzW9zPnchH8449M3CxHA",
  authDomain: "trade-mind-9fe52.firebaseapp.com",
  projectId: "trade-mind-9fe52",
  storageBucket: "trade-mind-9fe52.appspot.com",
  messagingSenderId: "912036654055",
  appId: "1:912036654055:web:afe612d3f0a42d74cdeb42",
  measurementId: "G-WMTCKK0S3S",
};

const app = initializeApp(firebaseConfig);

// App Check עם ReCAPTCHA V3
// ... אחרי initializeApp(app)
const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
console.log("AppCheck site key loaded?", Boolean(siteKey));

if (siteKey) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
    console.log("AppCheck initialized");
  } catch (e) {
    console.error("AppCheck init failed:", e);
  }
} else {
  console.warn(
    "No REACT_APP_RECAPTCHA_SITE_KEY found. Skipping AppCheck (dev-only)."
  );
}


export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
