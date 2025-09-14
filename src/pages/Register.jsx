// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";
import { db } from "../scripts/firebase-init.js";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import "../styles/register-login.css";
import "../styles/header.css";
import "../styles/footer.css";

export default function Register() {
  const navigate = useNavigate();
  const { signUp, loading: authLoading } = useAuth();
  const [params] = useSearchParams();
  const plan = (params.get("plan") || "basic").toLowerCase(); // plan from URL (?plan=basic/pro)

  const [fullName, setFullName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    const video = document.querySelector(".video-bg");
    if (video) {
      video.addEventListener("loadeddata", () => {
        video.classList.add("loaded");
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      alert("יש למלא את כל השדות");
      return;
    }

    setLoading(true);

    try {
      // יצירת משתמש עם AuthContext
      const user = await signUp(email, password, fullName);

      // שמירת פרטי משתמש + התכנית שנבחרה
      await setDoc(
        doc(db, "users", user.uid),
        {
          fullName,
          email,
          plan,                  // ← נשמרת התכנית
          planStatus: "pending", // ← לפני תשלום
          role: "user",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // ניווט ל-Checkout עם אותה תכנית
      navigate(`/checkout?plan=${plan}`, { replace: true });
    } catch (error) {
      // Error handling is done in AuthContext
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white relative">
      {/* Background Video */}
      <div className="video-wrapper absolute inset-0 z-[-10]">
        <div className="gradient-overlay"></div>
        <video autoPlay muted loop className="video-bg w-full h-full object-cover">
          <source src="/homepage-media/video-bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Main Form */}
      <main>
        <div className="auth-box">
          <h2 className="text-2xl font-bold text-center">Welcome to TradeMind</h2>
          <p className="text-center text-sm text-gray-300 mb-4">
            Selected plan: <span className="font-semibold text-white">{plan}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition disabled:opacity-60"
              disabled={loading || authLoading}
            >
              {(loading || authLoading) ? "נרשם... ⏳" : "Register"}
            </button>
          </form>

          <div className="text-center text-sm mt-3">
            <span>Already have an account?</span>
            <button
              onClick={() => navigate(`/login?plan=${plan}`)}
              className="text-blue-400 hover:underline ml-1"
            >
              Login instead
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
