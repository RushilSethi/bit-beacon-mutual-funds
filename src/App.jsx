import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import FundDetails from "./pages/FundDetails";
import Footer from "./components/Footer";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Router>
      <div className="bg-accent text-text p-4 flex justify-between items-center shadow-md relative">
        {/* Logo and Name */}
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Bit Beacon Logo" className="w-10 h-10" />
          <span className="text-xl font-bold text-text">Bit Beacon Mutual Funds</span>
        </div>

        {/* Buttons for Larger Screens */}
        <div className="hidden md:flex space-x-3">
          <Link to="/learn">
            <button className="border-2 border-primary text-primary px-4 py-2 rounded-lg transition duration-300 
              hover:bg-primary hover:text-black hover:shadow-[0_0_12px_#00a1ff]">
              Docs for Beginners
            </button>
          </Link>
          <a
            href="https://bit-beacon.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="border-2 border-secondary text-secondary px-4 py-2 rounded-lg transition duration-300 
              hover:bg-secondary hover:text-black hover:shadow-[0_0_12px_#00c298]">
              Explore Crypto Tracker
            </button>
          </a>
        </div>

        {/* Hamburger Menu for Small Screens */}
        <button
          className="md:hidden text-text focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setMenuOpen(false)}
          >
            <div className="absolute right-0 top-0 w-60 bg-accent shadow-lg h-screen p-5 flex flex-col space-y-4">
              <button className="self-end text-white" onClick={() => setMenuOpen(false)}>✖</button>
              <Link to="/learn" onClick={() => setMenuOpen(false)}>
                <button className="border-2 border-primary text-primary w-full px-4 py-2 rounded-lg transition duration-300 
                  hover:bg-primary hover:text-black hover:shadow-[0_0_12px_#00a1ff]">
                  Docs for Beginners
                </button>
              </Link>
              <a
                href="https://bit-beacon.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
              >
                <button className="border-2 border-secondary text-secondary w-full px-4 py-2 rounded-lg transition duration-300 
                  hover:bg-secondary hover:text-black hover:shadow-[0_0_12px_#00c298]">
                  Explore Crypto Tracker
                </button>
              </a>
            </div>
          </div>
        )}
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fund/:schemeCode" element={<FundDetails />} />
        <Route path="/learn" element={<LearnPage />} />
      </Routes>

      <Footer />
    </Router>
  );
}

// Placeholder for Learn Page
const LearnPage = () => (
  <div className="p-4 text-text">
    <h2 className="text-xl font-bold">Mutual Funds for Beginners</h2>
    <p className="mt-2">This page will explain the basics of mutual funds...</p>
  </div>
);

export default App;
