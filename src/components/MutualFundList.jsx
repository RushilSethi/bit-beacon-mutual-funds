import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const fundsData = [
  {
    name: "HDFC Mid-Cap Opportunities Fund",
    versions: {
      "Direct Plan - Growth": "118989",
      "Direct Plan - IDCW": "118988",
      "Regular Plan - Growth": "105758",
      "Regular Plan - IDCW": "105757",
    },
  },
  {
    name: "SBI Small Cap Fund",
    versions: {
      "Direct Plan - Growth": "125497",
      "Direct Plan - IDCW": "125496",
      "Regular Plan - Growth": "125494",
      "Regular Plan - IDCW": "125495",
    },
  },
  {
    name: "Nippon India Small Cap Fund",
    versions: {
      "Regular Plan - Growth": "113177",
      "Bonus Plan - Growth": "113178",
      "Direct Plan - Growth": "118778",
      "Direct Bonus Plan - Growth": "118777",
      "Direct Plan - IDCW": "118775",
      "Regular Plan - IDCW": "113179",
    },
  },
  {
    name: "HDFC Flexi Cap Fund",
    versions: {
      "Direct Plan - Growth": "118955",
      "Direct Plan - IDCW": "118954",
      "Regular Plan - Growth": "101762",
      "Regular Plan - IDCW": "101763",
    },
  },
  {
    name: "SBI Bluechip Fund",
    versions: {
      "Direct Plan - Growth": "119598",
      "Direct Plan - IDCW": "119585",
      "Regular Plan - Growth": "103504",
      "Regular Plan - IDCW": "103616",
    },
  },
  {
    name: "ICICI Prudential Bluechip Fund",
    versions: {
      "Direct Plan - Growth": "120586",
      "Direct Plan - IDCW": "120585",
      "Regular Plan - Growth": "108466",
      "Regular Plan - IDCW": "108465",
      "Institutional Option Plan - Growth": "108467",
    },
  },
  {
    name: "Motilal Oswal Midcap Fund",
    versions: {
      "Direct Plan - Growth": "127042",
      "Direct Plan - IDCW": "127044",
      "Regular Plan - Growth": "127039",
      "Regular Plan - IDCW": "127040",
    },
  },
  {
    name: "Parag Parikh Flexi Cap Fund",
    versions: {
      "Direct Plan - Growth": "122639",
      "Regular Plan - Growth": "122640",
    },
  },
  {
    name: "Quant Small Cap Fund",
    versions: {
      "Direct Plan - Growth": "120828",
      "Direct Plan - IDCW": "120827",
      "Regular Plan - Growth": "100177",
      "Regular Plan - IDCW": "100176",
    },
  },
  {
    name: "Axis Bluechip Fund",
    versions: {
      "Direct Plan - Growth": "120465",
      "Direct Plan - IDCW": "120466",
      "Regular Plan - Growth": "112277",
      "Regular Plan - IDCW": "112278",
    },
  },
];

const MutualFundList = () => {
  const [fundsWithNav, setFundsWithNav] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFundData = async () => {
      try {
        const updatedFunds = await Promise.all(
          fundsData.map(async (fund) => {
            const versionsWithNav = {};
            for (const versionName in fund.versions) {
              const schemeCode = fund.versions[versionName];
              const response = await fetch(
                `https://api.mfapi.in/mf/${schemeCode}/latest`
              );
              const data = await response.json();

              // Check if data.data exists and has at least one element
              if (data.data && data.data.length > 0) {
                versionsWithNav[versionName] = {
                  schemeCode,
                  latestNav: data.data[0].nav, // Access nav from the first element of data.data
                };
              } else {
                // If data.data is empty or undefined, set latestNav to "N/A"
                versionsWithNav[versionName] = {
                  schemeCode,
                  latestNav: "N/A",
                };
              }
            }
            return { ...fund, versions: versionsWithNav };
          })
        );
        setFundsWithNav(updatedFunds);
      } catch (error) {
        console.error("Error fetching fund data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFundData();
  }, []);

  const handleRowClick = (schemeCode) => {
    navigate(`/fund/${schemeCode}`);
  };

  return (
    <div className="p-4 text-text bg-background">
      <h2 className="text-xl font-bold">Popular Mutual Funds</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="mt-4">
          {fundsWithNav.map((fund) => (
            <div
              key={fund.name}
              className="collapse collapse-arrow border border-accent mb-2"
            >
              <input type="checkbox" className="peer" />
              <div className="collapse-title bg-accent text-primary peer-checked:bg-neutral peer-checked:text-text">
                {fund.name}
              </div>
              <div className="collapse-content bg-neutral text-text">
              <table className="w-full">
                  <thead>
                    <tr className="bg-accent text-primary">
                      <th className="p-2 text-left">Version</th>
                      <th className="p-2 text-left">Latest NAV</th>
                      <th className="p-2 text-left">Scheme Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(fund.versions).map(
                      ([versionName, versionData]) => (
                        <tr
                          key={versionData.schemeCode}
                          className="border-b border-accent cursor-pointer hover:bg-gray-700"
                          onClick={() => handleRowClick(versionData.schemeCode)}
                        >
                          <td className="p-2 text-left">{versionName}</td>
                          <td className="p-2 text-left">{versionData.latestNav}</td>
                          <td className="p-2 text-left">{versionData.schemeCode}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MutualFundList;