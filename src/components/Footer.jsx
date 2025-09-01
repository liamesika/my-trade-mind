import { Link } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext"; // או מיקום אחר

export default function Footer() {
  const { user, loading } = useAuth();

  return (
    <footer className="footer flex bg-black py-12 px-6">
      <div className="footer-logo-and-text">
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
        <p className="footer-description text-gray-400 mt-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>

      <div className="footer-menu-column flex mt-8">
        <div className="footer-menu flex">
          <nav className="flex">
            <Link to="/" className="menu-link" data-i18n="navHome">
              Home
            </Link>
            <Link to="/features" className="menu-link" data-i18n="navFeatures">
              Features
            </Link>
            <Link to="/" className="menu-link" data-i18n="navHowItWorks">
              How It Works
            </Link>
            <Link to="/pricing" className="menu-link" data-i18n="navPricing">
              Pricing
            </Link>
            <Link to="/chat" className="menu-link" data-i18n="navContact">
              Contact Us
            </Link>
          </nav>
        </div>
        <div className="footer-menu flex">
          <nav className="flex">
            <Link to="/privacy" className="menu-link" data-i18n="navPrivacy">
              Privacy Policy
            </Link>
            <Link to="/terms" className="menu-link" data-i18n="navTerms">
              Terms & Conditions
            </Link>
            {/* <div className="btn-small">
              <div className="btn-small-frame">
                <span className="btn-small-text" data-i18n="navSignUp">
                  Sign Up
                </span>
              </div>
            </div> */}
          </nav>
        </div>
      </div>

      <div className="footer-column mt-6">
        {!loading && !user && (
          <Link to="/prices" className="btn-small">
            <div className="btn-small-frame">
              <span className="btn-small-text" data-i18n="navSignUp">
                Sign Up
              </span>
            </div>
          </Link>
        )}
      </div>
    </footer>
  );
}
