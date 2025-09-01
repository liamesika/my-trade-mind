import "../styles/homepage.css";
import "../styles/features.css";
import VideoBackground from "../components/VideoBackground";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext"; // או מיקום אחר

export default function HomePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  return (
    <div className="text-white font-sans">
      <section className="hero-section relative flex flex-col items-center justify-center text-center px-4 py-32 z-10 w-[1440px] h-[804px] mx-auto">
        {/* Background video */}
        <VideoBackground />

        {/* Headline */}
        <div className="title-container">
          <h1 className="blur-text header-font">A New Era of Trade</h1>
          <h1 className="sharp-text header-font">A New Era of Trade</h1>
        </div>

        {/* Description */}
        <p className="relative mt-4 max-w-xl text-gray-300 text-lg z-10">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>

        {/* CTA */}

        {!loading && !user && (
          <button
            className="btn-large mt-8 z-10"
            onClick={() => navigate("/prices")}
          >
            <span className="btn-large-text">Sign Up</span>
          </button>
        )}

        {/* Dashboard visuals */}
        <div className="dashboard">
          <div className="box box1 flex-center">
            <img src="/homepage-media/loader.png" alt="loader 45%" />
          </div>
          <div className="box box2 flex-center">
            <img src="/homepage-media/chart.svg" alt="chart" />
          </div>
          <div className="box box3 flex-center">
            <img
              src="/homepage-media/TradeMind.svg"
              alt=""
              style={{ top: "10px", left: "-21px" }}
            />
            <img
              src="/homepage-media/TradeMind.svg"
              alt=""
              style={{ bottom: "17px", right: "-35px" }}
            />
          </div>
          <div className="box4">
            <img src="/homepage-media/card4-image.png" alt="Logo Icon" />
          </div>
          <div className="box box5 flex-center"></div>
          <div className="box box6 flex-center">
            <img
              src="/homepage-media/TradeMind.svg"
              alt=""
              style={{ top: "9px", right: "-80px" }}
            />
            <img
              src="/homepage-media/logo2.png"
              className="special-icon"
              alt="Visual Icon"
            />
            <img
              src="/homepage-media/TradeMind.svg"
              alt=""
              style={{ bottom: "7px", left: "-8px" }}
            />
          </div>
        </div>

        {/* Desktop Blurs */}
        <div className="glow-blurs-container" id="desktop">
          <div
            className="glow-effect"
            style={{
              top: "-210px",
              left: "-398px",
              width: "338px",
              height: "338px",
              backgroundColor: "#00e1fd",
              opacity: 0.1,
            }}
          ></div>
          <div
            className="glow-effect"
            style={{
              top: "-383px",
              left: "-440px",
              width: "85px",
              height: "85px",
              backgroundColor: "#00e1fd",
              opacity: 1,
            }}
          ></div>
          <div
            className="glow-effect"
            style={{
              top: "-260px",
              left: "-268px",
              width: "90.059px",
              height: "90.059px",
              backgroundColor: "#ca23ec",
              opacity: 1,
            }}
          ></div>
          <div
            className="glow-effect"
            style={{
              top: "-330px",
              left: "-128px",
              width: "85px",
              height: "85px",
              backgroundColor: "#ca23ec",
              opacity: 1,
            }}
          ></div>
          <div
            className="glow-effect"
            style={{
              top: "-45px",
              left: "245px",
              width: "64px",
              height: "64px",
              backgroundColor: "#ca23ec",
              opacity: 1,
            }}
          ></div>
          <div
            className="glow-effect"
            style={{
              top: "-385px",
              left: "-240px",
              width: "60px",
              height: "60px",
              backgroundColor: "#0020ff",
              opacity: 1,
            }}
          ></div>
          <div
            className="glow-effect"
            style={{
              top: "-50px",
              left: "373px",
              width: "108px",
              height: "108px",
              backgroundColor: "#5349f1",
              opacity: 1,
            }}
          ></div>
          <div
            className="glow-effect"
            style={{
              top: "-65px",
              left: "437px",
              width: "85px",
              height: "85px",
              backgroundColor: "#fb37ff",
              opacity: 1,
            }}
          ></div>
          <div
            className="glow-effect"
            style={{
              top: "-395px",
              left: "610px",
              width: "85px",
              height: "85px",
              backgroundColor: "#4d60e6",
              opacity: 1,
            }}
          ></div>

          <img
            src="/homepage-media/glow-dots.png"
            alt="glow dots"
            className="glow-dots"
            style={{
              top: "-694px",
              left: "-311px",
              width: "263px",
              height: "179px",
            }}
          />
          <img
            src="/homepage-media/glow-dots.png"
            alt="glow dots"
            className="glow-dots"
            style={{
              top: "-670px",
              left: "90px",
              width: "190px",
              height: "131px",
            }}
          />
        </div>

        {/* Mobile Blurs */}
        <div
          className="glow-blurs-container"
          id="mobile"
          style={{ position: "relative" }}
        >
          <div
            className="glow-effect"
            style={{
              top: "-185px",
              left: "-185px",
              width: "89px",
              height: "89px",
              backgroundColor: "#0020ff",
            }}
          ></div>
          <div
            className="glow-effect"
            style={{
              top: "-440px",
              left: "125px",
              width: "89px",
              height: "89px",
              backgroundColor: "#ca23ec",
              zIndex: 2,
            }}
          ></div>

          <img
            src="/homepage-media/glow-dots.png"
            alt="glow dots"
            className="glow-dots"
            id="first-dot"
            style={{ width: "171px", height: "125px" }}
          />
          <img
            src="/homepage-media/glow-dots.png"
            alt="glow dots"
            className="glow-dots"
            id="second-dot"
            style={{ width: "171px", height: "125px" }}
          />
        </div>
      </section>

      {/* המשך הסקשנים – למשל PipesSection, FeaturesSection וכו' */}
      <section className="pipes-section">
        {/* 🌫️ רקע גלו - סגול */}
        <div
          className="absolute z-0 w-[1073px] h-[533px] opacity-[0.15] blur-[45.45px] rounded-[15px]"
          style={{
            background: "#c481d1",
            border: "1px solid rgba(162, 156, 251, 0.66)",
            top: 0,
            left: 0,
          }}
        ></div>

        {/* 🌊 רקע של ה־Pipe */}
        <div className="pipe-background absolute inset-0 z-0 opacity-80">
          <img
            src="homepage-media/pipe-1.png"
            alt="Pipe 1"
            className="absolute left-0 w-full z-0 pointer-events-none"
            style={{ top: 0 }}
          />
          <img
            src="homepage-media/pipe-2.png"
            alt="Pipe 2"
            className="absolute left-0 w-full z-0 pointer-events-none"
            style={{ top: 195 }}
          />
          <img
            src="homepage-media/mobile-pipe.png"
            alt="Pipe 3"
            className="absolute left-0 w-full z-0 pointer-events-none"
            style={{ top: 987 }}
          />
          <img
            src="homepage-media/pipe-3.png"
            alt="Pipe 4"
            className="absolute left-0 w-full z-0 pointer-events-none"
            style={{ bottom: -460 }}
          />
        </div>

        {/* כרטיסים */}
        {[
          {
            title: "Smart Trade Analysis",
            desc: "Real-time AI feedback on every trade: strategy vs. emotions, market timing, and technical context – all in natural conversation.",
            img: "image/trade-analsis.png",
          },
          {
            title: "Next-Level Trade Journal",
            desc: "Log every trade with full detail: emotional state, reason for entry, visual charts, tags like FVG/CHoCH, and monthly breakdowns.",
            img: "image/dashboard.png",
          },
          {
            title: "Your 24/7 AI Mentor",
            desc: "Create your personal trading mentor, get tailored advice, weekly mindset reports, and grow faster with constant feedback.",
            img: "image/chat24-7.png",
          },
        ].map((item, idx) => (
          <div className="pipes-card" key={idx}>
            <div className="content-wrapper">
              <img
                src="homepage-media/glow-dots.png"
                alt="glow dots"
                className="pipes-glow-dots"
              />
              <p data-i18="pipes.section.title">Key Features</p>
              <h3
                className="header-font"
                data-i18={`pipes.card${idx + 1}.title`}
              >
                {item.title}
              </h3>
              <h4 data-i18={`pipes.card${idx + 1}.desc`}>{item.desc}</h4>
              {!loading && !user && (
                <button className="btn-large" data-i18="pipes.button">
                  Sign Up
                </button>
              )}
            </div>
            <div className="image-container w-full max-w-[581px] rounded-lg overflow-hidden mx-auto px-4">
              <div className="relative w-full h-[495px]">
                <img
                  src={item.img}
                  alt={`Card ${idx + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="block"></div>
              </div>
            </div>
          </div>
        ))}

        {/* רקע גלו נוסף */}
        <div
          className="glow-blurs-container"
          id="pipes"
          style={{ position: "relative" }}
        >
          <div
            className="glow-effect"
            style={{
              top: "-370px",
              left: "180px",
              width: "185px",
              height: "185px",
              backgroundColor: "#ca23ec",
              opacity: 0.3,
            }}
          ></div>
        </div>
      </section>


        <section className="info-section flex-center">
    <div className="flex flex-col gap-4 w-full">
      <h3 className="header-font">
        Lorem ipsum dolor sit amet consectetur. <span>Pellentesq</span>
      </h3>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>
    </div>
    <div className="btn-small">
      <div className="btn-small-frame">
        <span className="btn-small-text" data-i18n="navSignUp">
          Sign Up
        </span>
      </div>
    </div>
    <img src="image/footer.png" alt="Card 4" />
  </section>
    </div>
  );
}
