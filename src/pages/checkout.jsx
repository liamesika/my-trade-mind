// src/pages/Checkout.jsx
import React from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";

const PLANS = {
  basic: {
    name: "Basic",
    priceLabel: "₪79 / mo",
    features: ["Smart Trade Journal", "Basic Analytics", "Email Support"],
    paymentLink: process.env.REACT_APP_LINK_BASIC || "#",
  },
  pro: {
    name: "Pro",
    priceLabel: "₪149 / mo",
    features: ["Everything in Basic", "AI Mentor", "Advanced Analytics", "Priority Support"],
    paymentLink: process.env.REACT_APP_LINK_PRO || "#",
  },
  premium: {
    name: "Premium",
    priceLabel: "₪249 / mo",
    features: ["Everything in Pro", "Team Seats", "Exports", "1:1 Onboarding"],
    paymentLink: process.env.REACT_APP_LINK_PREMIUM || "#",
  },
};

export default function Checkout() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();

  const planKey = (params.get("plan") || "").toLowerCase();
  const plan = PLANS[planKey];

  // fallback: אם אין תכנית — נחזיר למחירון
  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-semibold mb-2">No plan selected</h1>
          <p className="text-gray-400 mb-6">Please choose a plan first.</p>
          <Link to="/prices" className="inline-block px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500">
            Go to Pricing
          </Link>
        </div>
      </div>
    );
  }

  // שמירה: אם משום מה הגענו בלי משתמש (למרות ההגנה ב-App.jsx)
  if (!user) {
    navigate(`/login?plan=${planKey}`, { replace: true });
    return null;
  }

  const handlePay = () => {
    // מעבר ישיר לקישור תשלום (Stripe Payment Link / Paddle / Tranzilla / PayPlus וכו')
    window.location.href = plan.paymentLink;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-gray-400 hover:text-gray-200"
        >
          ← Back
        </button>

        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6">
          <h1 className="text-3xl font-semibold mb-2">Checkout</h1>
          <p className="text-gray-400 mb-8">
            You&apos;re almost there. Review and continue to payment.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="text-xl font-medium mb-2">Plan summary</h2>
              <div className="text-2xl font-semibold mb-1">{plan.name}</div>
              <div className="text-sm text-gray-400 mb-4">{plan.priceLabel}</div>
              <ul className="space-y-2 text-gray-300">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Billing note (ללא הרשמה/טפסים) */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-lg font-medium mb-4">Billing</h3>
              <p className="text-gray-300 text-sm mb-4">
                The payment will be processed securely by our provider.
                Your account is already created — you&apos;re paying for <span className="text-white font-medium">{plan.name}</span>.
              </p>

              <div className="text-sm text-gray-400 mb-6">
                Logged in as <span className="text-white">{user?.email || user?.displayName || "user"}</span>
              </div>

              <button
                onClick={handlePay}
                className="w-full mt-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium"
              >
                Continue to payment
              </button>

              <p className="text-xs text-gray-500 mt-3">
                By continuing you agree to our Terms & Privacy.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Secure checkout via your selected PSP (Stripe / Paddle / PayPlus / Tranzilla)
        </p>
      </div>
    </div>
  );
}
