// /public/scripts/auth-nav-nahandler.js
import { watchAuthState, logout, currentUser } from "./firebase-auth.js";
import { translatePage } from "/lang/translations.js";

const signupBtn    = document.getElementById("signup-button");
const loginBtn     = document.getElementById("login-button");
const userGreeting = document.getElementById("user-greeting");

const navFeatures   = document.querySelectorAll('[data-i18n="navFeatures"]');
const navHowItWorks = document.querySelectorAll('[data-i18n="navHowItWorks"]');
const navPricing    = document.querySelectorAll('[data-i18n="navPricing"]');

function translateUserGreeting(user) {
  const lang = document.documentElement.lang;
  const name = user.displayName || user.email || "User";
  const helloText = lang === "he" ? "שלום" : "Hello";

  if (userGreeting) {
    userGreeting.innerHTML = `${helloText}, <span id="user-name">${name}</span>
      <button id="logout-button" class="ml-2 text-sm text-red-400 underline">
        ${lang === "he" ? "התנתק" : "Log Out"}
      </button>`;

    document.getElementById("logout-button")?.addEventListener("click", async () => {
      try {
        await logout();
        window.location.reload();
      } catch (err) {
        console.error("Error signing out:", err);
      }
    });
  }
}

function updateNavForUser(isLoggedIn) {
  const lang = document.documentElement.lang;

  navFeatures.forEach(link => {
    link.textContent = isLoggedIn ? (lang === "he" ? "סטטיסטיקות" : "Statistics")
                                  : (lang === "he" ? "מאפיינים" : "Features");
    link.setAttribute("href", isLoggedIn ? "/dashboard.html" : "/#features");
  });

  navHowItWorks.forEach(link => {
    link.textContent = isLoggedIn ? (lang === "he" ? "יומן מסחר" : "Trade Journal")
                                  : (lang === "he" ? "איך זה עובד" : "How It Works");
    link.setAttribute("href", isLoggedIn ? "/journal.html" : "/#how");
  });

  navPricing.forEach(link => {
    link.textContent = isLoggedIn ? (lang === "he" ? "צ'אט" : "Chat")
                                  : (lang === "he" ? "תמחור" : "Pricing");
    link.setAttribute("href", isLoggedIn ? "/chat.html" : "/#pricing");
  });
}

// מאזין סטטוס התחברות
watchAuthState({
  onIn: (user) => {
    updateNavForUser(true);
    if (signupBtn) signupBtn.style.display = "none";
    if (loginBtn)  loginBtn.style.display  = "none";
    if (userGreeting) {
      userGreeting.style.display = "block";
      translateUserGreeting(user);
    }
  },
  onOut: () => {
    updateNavForUser(false);
    if (signupBtn)    signupBtn.style.display    = "block";
    if (loginBtn)     loginBtn.style.display     = "block";
    if (userGreeting) userGreeting.style.display = "none";
  }
});

// כפתור החלפת שפה
document.getElementById("lang-toggle")?.addEventListener("click", () => {
  const currentLang = document.documentElement.lang;
  const newLang = currentLang === "en" ? "he" : "en";
  document.documentElement.lang = newLang;
  localStorage.setItem("lang", newLang);
  translatePage(newLang);

  const user = currentUser();
  if (user) translateUserGreeting(user);
  updateNavForUser(!!user);
});

// אתחול שפה ראשוני
const savedLang = localStorage.getItem("lang") || "en";
document.documentElement.lang = savedLang;
translatePage(savedLang);

// תפריט מובייל (בדיקות בטיחות)
const menuToggle  = document.getElementById("mobile-menu-toggle");
const menuClose   = document.getElementById("mobile-menu-close");
const mobileMenu  = document.getElementById("mobile-menu");

menuToggle?.addEventListener("click", () => mobileMenu?.classList.remove("hidden"));
menuClose?.addEventListener("click", () => mobileMenu?.classList.add("hidden"));
// תרגום קישורים ניווט
