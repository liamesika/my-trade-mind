import { Link } from "react-router-dom";
import "../styles/features.css";

export default function Features() {
  return (
    <div className="text-white bg-black">

      <div id="features-hero-bg"></div>
      <section className="features-hero flex-center">
        <div className="features-hero-inner header-font">
          <h1>
            Smart Trading Tools.
            <br />
            Strategic Thinking.
          </h1>
          <p>
            Discover the core features that make TradeMind your ultimate trading
            partner.
          </p>
        </div>
      </section>

      <section className="features-grid">
        <div className="feature-card">
          <img src="/image/features/dashboard.png" alt="Journal" />
          <h3 data-i18n="feature1Title">Smart Trade Journal</h3>
          <p data-i18n="feature1Desc">
            Automatically save your trades, analyze patterns and grow as a
            trader.
          </p>
        </div>
        <div className="feature-card">
          <img src="/image/features/chat.png" alt="AI Mentor" />
          <h3 data-i18n="feature2Title">AI Mentor</h3>
          <p data-i18n="feature2Desc">
            Receive emotional and technical feedback on each trade based on your
            inputs.
          </p>
        </div>
        <div className="feature-card">
          <img src="/image/features/dashboard.png" alt="Dashboard" />
          <h3 data-i18n="feature3Title">Performance Dashboard</h3>
          <p data-i18n="feature3Desc">
            Track progress with graphs, stats and custom insights.
          </p>
        </div>
        <div className="feature-card">
          <img src="/image/features/lng.png" alt="Languages" />
          <h3 data-i18n="feature4Title">Multi-language Support</h3>
          <p data-i18n="feature4Desc">
            Use the system in English or Hebrew. Your experience, your language.
          </p>
        </div>
        <div className="feature-card">
          <img src="/image/features/secure.png" alt="Cloud" />
          <h3 data-i18n="feature5Title">Secure Cloud Access</h3>
          <p data-i18n="feature5Desc">
            All your data saved safely with Firebase Authentication & Firestore.
          </p>
        </div>
      </section>

      <section className="comparison-section">
        <h2 className="glow-heading" data-i18n="compareTitle">
          Why TradeMind?
        </h2>
        <table className="comparison-table">
          <thead>
            <tr>
              <th data-i18n="compareFeature">Feature</th>
              <th data-i18n="compareTradeMind">TradeMind</th>
              <th data-i18n="compareOthers">Others</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td data-i18n="compareSmartJournal">Smart Trade Journal</td>
              <td>✅</td>
              <td>❌</td>
            </tr>
            <tr>
              <td data-i18n="compareAIMentor">AI Mentor Feedback</td>
              <td>✅</td>
              <td>❌</td>
            </tr>
            <tr>
              <td data-i18n="compareDashboard">Real-time Dashboard</td>
              <td>✅</td>
              <td>❌</td>
            </tr>
            <tr>
              <td data-i18n="compareLanguages">Multi-language</td>
              <td>✅</td>
              <td>✅</td>
            </tr>
            <tr>
              <td data-i18n="compareSecureCloud">Secure Cloud Access</td>
              <td>✅</td>
              <td>⚠️</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section
        className="cta-section flex-center"
        style={{ background: "#000019" }}
      >
        <div className="cta-content">
          <h2 data-i18n="ctaTitle">Ready to trade smarter?</h2>
          <Link to="/register" className="cta-btn" data-i18n="ctaBtn">
            Join Now
          </Link>
        </div>
      </section>

    </div>
  );
}
