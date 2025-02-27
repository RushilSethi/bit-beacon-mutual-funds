import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MutualFundSelector from "../components/MutualFundSelector";
import MutualFundList from "../components/MutualFundList";

const Home = () => {
  const [showSelector, setShowSelector] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <h1 className="text-3xl font-bold mb-4">Mutual Fund Explorer</h1>

      <button
        className="btn btn-primary w-full"
        onClick={() => setShowSelector(!showSelector)}
      >
        {showSelector ? "Close Fund Selector" : "Select a Mutual Fund"}
      </button>

      {showSelector && (
        <MutualFundSelector
          onSelect={(fund) => navigate(`/fund/${fund.schemeCode}`)}
        />
      )}

      <MutualFundList />
    </div>
  );
};

export default Home;