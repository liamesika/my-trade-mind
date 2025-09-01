// src/lang/useLang.js
import { useEffect, useState } from "react";
import { translations } from "./translations";

export default function useLang() {
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
    localStorage.setItem("lang", lang);
  }, [lang]);

  const t = (key) => translations[lang]?.[key] || key;

  const toggleLang = () => setLang(lang === "en" ? "he" : "en");

  return { lang, t, toggleLang };
}