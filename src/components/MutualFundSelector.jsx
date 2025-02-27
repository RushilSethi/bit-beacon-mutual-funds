import { useState, useEffect, useRef } from "react";

const MutualFundSelector = ({ onSelect }) => {
  const [funds, setFunds] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("Loading...");
  const [currentPage, setCurrentPage] = useState(1);
  const chunkSize = 30;
  const filterTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchAllFunds = async () => {
      try {
        setLoadingStatus("Fetching all mutual funds...");
        const response = await fetch("https://api.mfapi.in/mf");
        const data = await response.json();

        setLoadingStatus(`Processing ${data.length} funds...`);

        setTimeout(() => {
          setFunds(data);
          setLoadingStatus("");
          setLoading(false);
        }, 0);
      } catch (error) {
        console.error("Error fetching mutual funds:", error);
        setLoadingStatus("Error loading funds. Please try again.");
      }
    };

    fetchAllFunds();
  }, []);

  const getFilteredFunds = () => {
    if (!search.trim()) return funds;

    const searchLower = search.toLowerCase();
    return funds.filter((fund) =>
      fund.schemeName.toLowerCase().includes(searchLower)
    );
  };

  const totalPages = Math.ceil(getFilteredFunds().length / chunkSize);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const getCurrentPageFunds = () => {
    const filtered = getFilteredFunds();
    const startIndex = (currentPage - 1) * chunkSize;
    const endIndex = startIndex + chunkSize;
    return filtered.slice(startIndex, endIndex);
  };

  // Debounced search
  useEffect(() => {
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    if (!loading) {
      filterTimeoutRef.current = setTimeout(() => {
        setCurrentPage(1);
      }, 300);
    }

    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [search, loading]);

  return (
    <div className="bg-accent p-4 rounded-lg shadow-md mt-4">
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search mutual funds..."
          className="input input-bordered w-full bg-neutral text-text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="ml-4 text-sm text-gray-400">
          {!loading && `${getFilteredFunds().length} funds`}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center mt-4 h-60">
          <span className="loading loading-spinner loading-lg text-primary mb-2"></span>
          <p className="text-gray-400">{loadingStatus}</p>
        </div>
      ) : (
        <div>
          <div className="mt-2 max-h-60 overflow-y-auto">
            {getCurrentPageFunds().map((fund) => (
              <div
                key={fund.schemeCode}
                className="cursor-pointer p-2 hover:bg-primary hover:text-black rounded-lg w-full"
                onClick={() => onSelect(fund)}
              >
                {fund.schemeName}
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-4">
            <button
              className="btn btn-sm mr-2"
              onClick={handlePrevPage}
              disabled={currentPage === 1 || totalPages === 0}
            >
              &lt;
            </button>
            <span>
              {totalPages > 0 ? `${currentPage} / ${totalPages}` : "0 / 0"}
            </span>
            <button
              className="btn btn-sm ml-2"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MutualFundSelector;