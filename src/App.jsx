// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./firebase/AuthContext";
import Checkout from "./pages/checkout";

import HomePage from "./pages/HomePage";
import Features from "./pages/Features";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Prices from "./pages/Prices";
import NotFoundPage from "./pages/404";
import TradeJournal from "./pages/TradeJournal";
import Onboarding from "./pages/Onboarding";
import ChatPage from "./pages/Chat";
import Dashboard from "./pages/dashboard";

import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  // בזמן טעינת מצב ההתחברות – אפשר להחזיר ספינר קטן/כלום
  if (loading) return null; // או: <div className="loader" />

  return (
    <>
      {/* מציגים Header רק לפני login */}
      {!user && <Header />}

      <Routes>
        {/* דף הבית: אם מחוברים -> מפנים לדשבורד */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <HomePage />}
        />

        {/* עמודים ציבוריים */}
        <Route path="/features" element={<Features />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route path="/prices" element={<Prices />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route
            path="/checkout"
            element={user ? <Checkout /> : <Navigate to={`/login?plan=${new URLSearchParams(location.search).get("plan") || "basic"}`} replace />}
          />

        {/* עמודים שמוגנים להתחברות */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/journal"
          element={user ? <TradeJournal /> : <Navigate to="/login" replace />}
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Footer />
    </>
  );
}
