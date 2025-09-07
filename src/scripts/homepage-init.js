// scripts/homepage-init.js
import { translatePage } from "../lang/translations.js";
import { watchAuthState, logout } from "./firebase-auth.js";
import { auth } from "./firebase-init.js";

// 1) שפה
const savedLang = localStorage.getItem("lang") || "en";
document.documentElement.lang = savedLang;
translatePage(savedLang);

const langToggle = document.getElementById("lang-toggle");
if (langToggle) {
  langToggle.textContent = savedLang === "he" ? "English" : "עברית";
  langToggle.addEventListener("click", () => {
    const newLang = document.documentElement.lang === "en" ? "he" : "en";
    document.documentElement.lang = newLang;
    localStorage.setItem("lang", newLang);
    translatePage(newLang);
    langToggle.textContent = newLang === "he" ? "English" : "עברית";
  });
}

// 2) ניהול תפריט מובייל (אם צריך)
const mobileMenu = document.getElementById("mobile-menu");
const mobileOpen = document.getElementById("mobile-menu-toggle");
const mobileClose = document.getElementById("mobile-menu-close");
if (mobileMenu && mobileOpen && mobileClose) {
  mobileOpen.addEventListener("click", () => mobileMenu.classList.remove("hidden"));
  mobileClose.addEventListener("click", () => mobileMenu.classList.add("hidden"));
}

// 3) ברכת משתמש בצורה בטוחה (ללא innerHTML)
const signupBtn = document.getElementById("signup-button");
const loginBtn = document.getElementById("login-button");
const userGreeting = document.getElementById("user-greeting");

function renderGreeting(user) {
  if (!userGreeting) return;
  userGreeting.style.display = "block";
  userGreeting.textContent = ""; // נקה תוכן קודם

  const helloText = document.documentElement.lang === "he" ? "שלום" : "Hello";
  const name = user.displayName || user.email || "User";

  const helloNode = document.createTextNode(`${helloText}, `);

  const nameSpan = document.createElement("span");
  nameSpan.id = "user-name";
  nameSpan.textContent = name; // בטוח — לא HTML

  const space = document.createTextNode(" ");

  const logoutBtn = document.createElement("button");
  logoutBtn.id = "logout-button";
  logoutBtn.className = "ml-2 text-sm text-red-400 underline";
  logoutBtn.textContent = document.documentElement.lang === "he" ? "התנתק" : "Log Out";
  logoutBtn.addEventListener("click", () => logout(auth).then(() => window.location.reload()));

  userGreeting.append(helloNode, nameSpan, space, logoutBtn);
}

watchAuthState({
  onIn: (user) => {
    if (signupBtn) signupBtn.style.display = "none";
    if (loginBtn) loginBtn.style.display = "none";
    renderGreeting(user);
  },
  onOut: () => {
    if (signupBtn) signupBtn.style.display = "block";
    if (loginBtn) loginBtn.style.display = "block";
    if (userGreeting) userGreeting.style.display = "none";
  }
});
