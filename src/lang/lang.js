// lang.js

// ✅ פונקציית קביעת שפה והחלת תרגומים
function setLanguage(lang) {
  localStorage.setItem("lang", lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "he" ? "rtl" : "ltr";

  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.innerText = translations[lang][key];
    }
  });

  const placeholders = document.querySelectorAll("[data-i18n-placeholder]");
  placeholders.forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });

  const toggleBtn = document.getElementById("lang-toggle");
  if (toggleBtn) {
    toggleBtn.textContent = lang === "he" ? "ENG" : "HE";
  }

  // יישור טקסט כללי לפי שפה
  document.body.classList.toggle("text-right", lang === "he");
  document.body.classList.toggle("text-left", lang === "en");
}

// ✅ החלפה בין שפות בלחיצה
function toggleLanguage() {
  const currentLang = localStorage.getItem("lang") || "en";
  const newLang = currentLang === "he" ? "en" : "he";
  setLanguage(newLang);
}

// ✅ בעת טעינה - החלת השפה השמורה והוספת האירוע
window.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("lang") || "he";
  setLanguage(savedLang);

  const toggleBtn = document.getElementById("lang-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleLanguage);
  }
});
