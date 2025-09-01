 // eslint-disable-next-line

/* eslint-disable */
 const translations = {
  en: {
    navHome: "Home",
    navFeatures: "Features",
    navHowItWorks: "How It Works",
    navPricing: "Pricing",
    navContact: "Contact",
    navLogin: "Log In",
    navSignUp: "Sign Up",
    signUpBtn: "Sign Up",
    journalPageTitle: "Trade Journal",
    journalTitle: "📘 Trade Journal",
    addTrade: "➕ Add Trade",
    chatPageTitle: "Chat with your mentor",
    // journalPageTitle: "Trade Journal",
    changeLanguage: "Change Language",
    send: "Send",
    addTrade: "Add Trade",
    journalTitle: "📘 Trade Journal",
    yourTrades: "Your Trades",
    chatSubtitle: "Ask anything about trading",
    chatPlaceholder: "Type your message...",
    mentorNameLabel: "Your Mentor",
    logout: "Logout",
    mentorTitle: "Choose your mentor",
    mentorDesc: "The mentor will guide you in every chat",
    placeholderName: "Enter mentor name...",
    continue: "Continue",
    onboardingHeader: "Let's get to know you...",
    q1: "What is your name?",
    q2: "How often do you trade?",
    q3: "What is your strongest trading area?",
    q4: "What's your biggest goal this year?",
    q5: "What would you like to improve?",
    mentorWomanTitle: "Woman",
    mentorWomanDesc: "Experienced Mentor",
    mentorManTitle: "Man",
    mentorManDesc: "Professional Mentor",
    mentorRobotTitle: "Robot",
    mentorRobotDesc: "AI Mentor",
    next: "Next",
    startChat: "Start Chat",
    chatWith: "Chat with your mentor",
    chatPageTitle: "Chat with your mentor",
    chatSubtitle: "Private chat with your AI mentor",
    chatPlaceholder: "Type your message...",
    send: "Send",
    registerPageTitle: "TradeMind | Register / Login",
    welcome: "Welcome to TradeMind",
    fullName: "Full Name",
    email: "Email",
    password: "Password",
    registerBtn: "Register",
    alreadyRegistered: "Already have an account?",
    switchToLogin: "Login instead",
    langButton: "עברית",
    loginPageTitle: "Login - TradeMind",
    loginHeader: "Login to TradeMind",
    loginBtn: "Login",
    noAccount: "Don't have an account?",
    registerLink: "Register",
    alreadyHaveAccount: "Already have an account?",
    loginInstead: "login instead",
  },
  he: {
    navHome: "דף הבית",
    navFeatures: "מאפיינים",
    navHowItWorks: "איך זה עובד",
    navPricing: "תמחור",
    navContact: "צור קשר",
    navLogin: "התחברות",
    navSignUp: "הרשמה",
    signUpBtn: "להרשמה",
    // journalPageTitle: "יומן המסחר",
    journalTitle: "📘 יומן מסחר",
    addTrade: "➕ הוסף עסקה",
    chatPageTitle: "צ'אט עם המנטור שלך",
    journalPageTitle: "יומן המסחר",
    changeLanguage: "שנה שפה",
    send: "שלח",
    addTrade: "הוסף עסקה",
    journalTitle: "📘 יומן מסחר",
    yourTrades: "העסקאות שלך",
    chatSubtitle: "שאל כל דבר על מסחר",
    chatPlaceholder: "הקלד את ההודעה שלך...",
    mentorNameLabel: "המנטור שלך",
    logout: "התנתק",
    mentorTitle: "בחר את דמות המנטור שלך",
    mentorDesc: "הדמות תלווה אותך בכל שיחה עם המנטור",
    placeholderName: "הכנס שם מנטור...",
    continue: "המשך",
    onboardingHeader: "כמה שאלות להיכרות...",
    q1: "איך קוראים לך?",
    q2: "באיזו תדירות אתה סוחר?",
    q3: "מה התחום שאתה הכי חזק בו במסחר?",
    q4: "מה היעד הכי גדול שלך לשנה הקרובה?",
    q5: "האם יש משהו שהיית רוצה לשפר?",
    next: "הבא",
    startChat: "התחל צ'אט",
    chatWith: "צ'אט עם המנטור שלך",
    mentorWomanTitle: "אישה",
    mentorWomanDesc: "מנטורית מנוסה",
    mentorManTitle: "גבר",
    mentorManDesc: "מנטור מקצועי",
    mentorRobotTitle: "רובוט",
    mentorRobotDesc: "מנטור AI",
    chatPageTitle: "צ'אט עם המנטור שלך",
    chatSubtitle: "צ'אט אישי עם מנטור AI",
    chatPlaceholder: "כתוב הודעה ולחץ אנטר...",
    send: "שלח",
    registerPageTitle: "TradeMind | הרשמה / התחברות",
    welcome: "ברוך הבא ל־TradeMind",
    fullName: "שם מלא",
    email: "אימייל",
    password: "סיסמה",
    registerBtn: "הרשמה",
    alreadyRegistered: "כבר רשום?",
    switchToLogin: "התחבר במקום",
    langButton: "ENG",
    loginPageTitle: "התחברות - TradeMind",
    loginHeader: "התחברות ל־TradeMind",
    loginBtn: "התחברות",
    noAccount: "אין לך חשבון?",
    registerLink: "להרשמה",
    alreadyHaveAccount: "האם יש לך חשבון?",
    loginInstead: "התחבר במקום",

  }
};
let currentLang = localStorage.getItem("lang") || "en";

// פונקציה לתרגום הדף לפי שפה
export function translatePage(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "he" ? "rtl" : "ltr";

  // תרגום טקסטים רגילים
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // תרגום placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (translations[lang][key]) {
      el.setAttribute("placeholder", translations[lang][key]);
    }
  });

  // תרגום כפתור שינוי שפה
  const langBtn = document.getElementById("lang-toggle");
  if (langBtn) {
    langBtn.textContent = translations[lang].langButton;
  }
}

// יצוא גם של האובייקט אם את רוצה להשתמש בו בקבצים אחרים
export { translations, currentLang };