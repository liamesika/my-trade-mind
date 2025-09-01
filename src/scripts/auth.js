import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
//import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase config שלך
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
const auth = getAuth(app);
const db = getFirestore(app);



document.getElementById("auth-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("full-name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!fullName || !email || !password) {
    alert("אנא מלאי את כל השדות");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // עדכון פרופיל עם שם משתמש
    await updateProfile(user, { displayName: fullName });

    // שמירה במסד נתונים
    await setDoc(doc(db, "users", user.uid), {
      fullName,
      email,
      createdAt: new Date()
    });

    console.log("🟢 נרשמת בהצלחה", user.uid);
    window.location.href = "index.html";

  } catch (error) {
    console.error("❌ שגיאה בהרשמה:", error);
    alert("שגיאה בהרשמה: " + error.message);
  }
});

export { auth };
