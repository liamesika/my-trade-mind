// scripts/auth-guard.js
import { watchAuthState } from "./firebase-auth.js";
import { getFirestore, doc, getDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// ---- Config by <meta> tags in <head> ----
function readMeta(name, fallback = null) {
  const el = document.querySelector(`meta[name="${name}"]`);
  return el?.content?.trim() || fallback;
}

const REQUIRE_PLAN = (readMeta("tm-required-plan", "any") || "any").toLowerCase(); // any|basic|premium
const REQUIRE_ROLE = readMeta("tm-required-role", "").toLowerCase();                // optional
const LOGIN_URL    = readMeta("tm-login-url", "/login.html");
const UPGRADE_URL  = readMeta("tm-upgrade-url", "/pricing.html");

// hide page until guard passes
document.documentElement.style.visibility = "hidden";

const db = getFirestore();

function isPremiumActive(userDoc) {
  const plan = (userDoc?.plan || "basic").toLowerCase();
  if (plan !== "premium") return false;
  const until = userDoc?.premiumUntil;
  if (!until) return true;
  const now = Timestamp.now();
  try {
    return until.toMillis ? until.toMillis() > now.toMillis() : false;
  } catch {
    return false;
  }
}

function hasRequiredRole(userDoc, requireRole) {
  if (!requireRole) return true;
  const roles = Array.isArray(userDoc?.roles) ? userDoc.roles.map(r => String(r).toLowerCase()) : [];
  return roles.includes(requireRole);
}

function redirectWithReturn(to) {
  const ret = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.replace(`${to}?return=${ret}`);

}

watchAuthState({
  onOut: () => {
    console.warn("⛔ לא מחובר – מפנה לדף התחברות");
    redirectWithReturn(LOGIN_URL);
  },
  onIn: async (user) => {
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      const userDoc = snap.exists() ? snap.data() : { plan: "basic", roles: [] };

      if (!hasRequiredRole(userDoc, REQUIRE_ROLE)) {
        console.warn("⛔ אין תפקיד מתאים:", REQUIRE_ROLE);
        return redirectWithReturn(UPGRADE_URL);
      }

      const plan = (userDoc.plan || "basic").toLowerCase();
      let ok = true;
      if (REQUIRE_PLAN === "premium") ok = isPremiumActive(userDoc);
      else if (REQUIRE_PLAN === "basic") ok = plan === "basic" || isPremiumActive(userDoc);

      if (!ok) {
        console.warn("⛔ הרשאת מנוי לא מספקת. נדרש:", REQUIRE_PLAN, "למשתמש יש:", plan);
        return redirectWithReturn(UPGRADE_URL);
      }

      document.documentElement.style.visibility = "visible";
      console.log("✅ Guard passed:", { uid: user.uid, plan, roleOk: hasRequiredRole(userDoc, REQUIRE_ROLE) });
    } catch (err) {
      console.error("❌ Auth guard error:", err);
      redirectWithReturn(LOGIN_URL);
    }
  }
});
