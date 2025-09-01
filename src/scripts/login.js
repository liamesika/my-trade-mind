// scripts/login.js

// ייבוא auth בלבד כי firebase-init כבר כולל את האתחול המלא
import { auth } from "../firebase/firebase-init.js";
import { signInWithEmailAndPassword } from "firebase/auth";

import {
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const langToggle = document.getElementById('lang-toggle');
  const submitBtn = form.querySelector("button[type='submit']");

  // התחברות משתמש
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
      alert("אנא מלא את כל השדות");
      return;
    }

    submitBtn.innerText = "מתחבר... ⏳";
    submitBtn.disabled = true;

    try {
      // שומר את המשתמש גם אחרי רענון
      await setPersistence(auth, browserLocalPersistence);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      localStorage.setItem("userId", user.uid);
      localStorage.setItem("userName", user.displayName || "");

      console.log("✅ התחברות בוצעה בהצלחה");
      window.location.href = "index.html";
    } catch (error) {
      console.error("❌ שגיאה בהתחברות:", error);
      alert("שגיאה בהתחברות: " + error.message);
    }

    submitBtn.innerText = "התחבר";
    submitBtn.disabled = false;
  });

  // מתג שפה
  if (langToggle) {
    langToggle.addEventListener('click', function () {
      const currentLang = document.documentElement.lang;
      const newLang = currentLang === 'en' ? 'he' : 'en';
      document.documentElement.lang = newLang;

      document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = el.getAttribute(`data-i18n-${newLang}`) || el.textContent;
      });

      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const placeholder = el.getAttribute(`data-i18n-placeholder-${newLang}`);
        if (placeholder) el.setAttribute('placeholder', placeholder);
      });
    });
  }
});
