// import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// import { auth } from "../firebase/firebase";
// import { watchAuthState, logout } from "../firebase/firebase-auth";
import "../styles/prices.css";


export default function Prices() {
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const unsubscribe = watchAuthState({
//       onIn: (user) => setUser(user),
//       onOut: () => setUser(null),
//     });
//     return unsubscribe;
//   }, []);

//   const handleLogout = () => {
//     logout(auth).then(() => {
//       setUser(null);
//     });
//   };

  return (
    <div className="bg-black text-white font-sans">
      {/* Header */}

      {/* Pricing Section */}
      <section className="pricing-section py-20 px-6 bg-gradient-to-b from-[#000019] to-[#0a0a1f]">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-glow">
            Choose Your Plan
          </h1>
          <p className="text-gray-400">
            Select the plan that fits your trading goals best.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <div className="pricing-card bg-[#101020] rounded-2xl p-8 text-center shadow-xl border border-[#222] hover:shadow-purple-500/20 transition">
            <h2 className="text-2xl font-bold text-blue-400 mb-2">Basic</h2>
            <p className="text-gray-300 mb-6">
              Everything you need to get started.
            </p>
            <ul className="text-left text-sm text-gray-400 space-y-2 mb-6">
              <li>✔️ Smart Trade Journal</li>
              <li>✔️ Basic Dashboard Stats</li>
              <li>✔️ AI Mentor (Limited Feedback)</li>
              <li>✔️ 1 Language Supported</li>
              <li>✔️ Secure Data Sync</li>
            </ul>
            <div className="text-3xl font-semibold text-white mb-4">$0</div>
            <Link to="/register?plan=basic" className="cta-btn">
              Join Now
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="pricing-card bg-gradient-to-br from-[#1a0033] to-[#000033] rounded-2xl p-8 text-center shadow-2xl border border-[#333] hover:shadow-pink-500/20 transition relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-3 py-1 rounded-bl-xl tracking-wide">
              Most Popular
            </div>
            <h2 className="text-2xl font-bold text-purple-400 mb-2">Pro</h2>
            <p className="text-gray-300 mb-6">
              Advanced tools for serious traders.
            </p>
            <ul className="text-left text-sm text-gray-300 space-y-2 mb-6">
              <li>✔️ Everything in Basic</li>
              <li>✔️ Full AI Mentor Feedback</li>
              <li>✔️ Real-time Dashboard + Alerts</li>
              <li>✔️ Multi-language</li>
              <li>✔️ Cloud History & Export</li>
            </ul>
            <div className="text-3xl font-semibold text-white mb-4">$19/mo</div>
            <Link to="/register?plan=pro" className="cta-btn">
              Join Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}

    </div>
  );
}
