// Header.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";
import { useLanguage } from "../i18n/useLanguage";
import LanguageToggle from "./LanguageToggle";
import "../styles/design-tokens.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  const handleMenuToggle = () => setMenuOpen(!menuOpen);
  const handleMenuClose = () => setMenuOpen(false);

  return (
    <>
      {/* Language Toggle */}
      <div className="absolute top-4 left-4 z-50">
        <LanguageToggle variant="header" />
      </div>

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
          <Link to="/" className="menu-text flex">
            {t('nav.home')}
          </Link>
          <Link to="/features" className="menu-text flex">
            {t('nav.features')}
          </Link>
          <a href="#how" className="menu-text flex">
            {t('nav.howItWorks')}
          </a>
          <Link to="/prices" className="menu-text flex">
            {t('nav.pricing')}
          </Link>
          <Link to="/chat" className="menu-text flex">
            {t('nav.contact')}
          </Link>
        </nav>

        {!loading && !user && (
          <>
            <div className="btns flex" id="signup-button">
              <Link to="/prices" className="btn-small flex-center">
                <div className="btn-small-frame flex-center">
                  <span className="btn-small-text">
                    {t('nav.signUp')}
                  </span>
                </div>
              </Link>
            </div>
            <div className="log-in flex-center" id="login-button">
              <Link to="/login" className="btn-small flex-center">
                <span className="log-in-dot"></span>
                <span className="log-in-text">
                  {t('nav.login')}
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
            <a href="#home" className="mobile-link">
              {t('nav.home')}
            </a>
            <a href="#features" className="mobile-link">
              {t('nav.features')}
            </a>
            <a href="#how" className="mobile-link">
              {t('nav.howItWorks')}
            </a>
            <a href="#pricing" className="mobile-link">
              {t('nav.pricing')}
            </a>
            <a href="#contact" className="mobile-link">
              {t('nav.contact')}
            </a>
            {!user && (
              <>
                <Link to="/login" className="mobile-link">
                  {t('nav.login')}
                </Link>
                <Link to="/prices" className="mobile-link special">
                  {t('nav.signUp')}
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
