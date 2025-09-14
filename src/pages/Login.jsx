// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../firebase/AuthContext";
import useLang from "../lang/useLang";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { t } = useLang();
  const { signIn, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert(t("fillAllFields"));

    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (error) {
      // Error handling is done in AuthContext
      console.error("Login failed:", error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">

      <form className="bg-gray-800 p-6 rounded-lg w-80" onSubmit={handleLogin}>
        <h2 className="text-xl font-bold mb-4 text-center">{t("loginHeader")}</h2>
        <input
          type="email"
          placeholder={t("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="password"
          placeholder={t("password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
        />
        <button
          type="submit"
          disabled={loading || authLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 p-2 rounded"
        >
          {(loading || authLoading) ? "..." : t("loginBtn")}
        </button>
      </form>
    </div>
  );
}