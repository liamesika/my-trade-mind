// Header.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { translatePage } from "../lang/translations";
import { useAuth } from "../firebase/AuthContext"; // או מיקום אחר

export default function Header() {
  const [lang, setLang] = useState("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "en";
    setLang(savedLang);
    document.documentElement.lang = savedLang;
    translatePage(savedLang);
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "he" : "en";
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    document.documentElement.lang = newLang;
    window.location.reload();
  };

  const handleMenuToggle = () => setMenuOpen(!menuOpen);
  const handleMenuClose = () => setMenuOpen(false);

  return (
    <>
      {/* Language Toggle */}
      <button
        className="absolute top-4 left-4 text-sm bg-blue-700 px-2 py-1 rounded w-12 z-50"
        onClick={toggleLanguage}
      >
        {lang === "he" ? "English" : "עברית"}
      </button>

      {/* Desktop Header */}
      <header className="header flex-center">
        <Link to="/" className="logo flex">
          <div className="logo flex">
            <div className="logo-icon">
              <img
                src="homepage-media/logo.png"
                alt="Logo Icon"
                className="logo-icon"
              />
            </div>
            <div className="logo-text">
              <img src="homepage-media/TradeMind.svg" alt="TradeMind" />
            </div>
          </div>
        </Link>

        <nav className="menu flex">
          <Link to="/" className="menu-text flex" data-i18n="navHome">
            Home
          </Link>
          <Link
            to="/features"
            className="menu-text flex"
            data-i18n="navFeatures"
          >
            Features
          </Link>
          <a href="#how" className="menu-text flex" data-i18n="navHowItWorks">
            How It Works
          </a>
          <Link to="/prices" className="menu-text flex" data-i18n="navPricing">
            Pricing
          </Link>
          <Link to="/chat" className="menu-text flex" data-i18n="navContact">
            Contact Us
          </Link>
        </nav>

        {!loading && !user && (
          <>
            <div className="btns flex" id="signup-button">
              <Link to="/prices" className="btn-small flex-center">
                <div className="btn-small-frame flex-center">
                  <span className="btn-small-text" data-i18n="navSignUp">
                    Sign Up
                  </span>
                </div>
              </Link>
            </div>
            <div className="log-in flex-center" id="login-button">
              <Link to="/login" className="btn-small flex-center">
                <span className="log-in-dot"></span>
                <span className="log-in-text" data-i18n="navLogin">
                  Log In
                </span>
              </Link>
            </div>
          </>
        )}

        {user && (
          <div className="text-white font-bold px-4">
            שלום, <span>{user.displayName || user.email}</span>
          </div>
        )}
      </header>

      {/* Mobile Header */}
      <header className="header-mobile flex">
        <div className="mobile-header-inner flex">
          <Link to="/" className="logo flex">
            <div className="logo flex">
              <div className="logo-icon">
                <img
                  src="homepage-media/logo.png"
                  alt="Logo Icon"
                  className="logo-icon"
                />
              </div>
              <div className="logo-text">
                <img src="homepage-media/TradeMind.svg" alt="TradeMind" />
              </div>
            </div>
          </Link>
          <button onClick={handleMenuToggle} className="mobile-menu-icon">
            <img src="homepage-media/menu-icon.svg" alt="Open Menu" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-header flex-center">
            <div className="logo flex">
              <div className="logo-icon">
                <img
                  src="homepage-media/logo.png"
                  alt="Logo Icon"
                  className="logo-icon"
                />
              </div>
              <div className="logo-text">
                <img src="homepage-media/TradeMind.svg" alt="TradeMind" />
              </div>
            </div>
            <button onClick={handleMenuClose} className="mobile-menu-close">
              <img src="homepage-media/close-icon.svg" alt="Close Menu" />
            </button>
          </div>

          <nav className="mobile-menu-items flex-center">
            <a href="#home" className="mobile-link" data-i18n="navHome">
              Home
            </a>
            <a href="#features" className="mobile-link" data-i18n="navFeatures">
              Features
            </a>
            <a href="#how" className="mobile-link" data-i18n="navHowItWorks">
              How It Works
            </a>
            <a href="#pricing" className="mobile-link" data-i18n="navPricing">
              Pricing
            </a>
            <a href="#contact" className="mobile-link" data-i18n="navContact">
              Contact Us
            </a>
            {!user && (
              <>
                <Link to="/login" className="mobile-link" data-i18n="navLogin">
                  Log In
                </Link>
                <Link
                  to="/prices"
                  className="mobile-link special"
                  data-i18n="navSignUp"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          <div className="mobile-menu-footer-icon">
            <img
              src="homepage-media/logo2.png"
              className="special-icon"
              alt="Logo Icon"
            />
          </div>
        </div>
      )}
    </>
  );
}
