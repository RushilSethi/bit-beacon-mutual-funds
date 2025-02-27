import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const FundDetails = () => {
  const { schemeCode } = useParams();
  const [fundData, setFundData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [growthStats, setGrowthStats] = useState(null);
  const [processedNavData, setProcessedNavData] = useState([]);

  const [performanceScore, setPerformanceScore] = useState(null);
  const [stabilityRating, setStabilityRating] = useState(null);
  const [growthTrend, setGrowthTrend] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);
  const [consistencyScore, setConsistencyScore] = useState(null);

  const [metricsDetails, setMetricsDetails] = useState({
    performanceValue: null,
    stabilityValue: null,
    trendValue: null,
    consistencyValue: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchFundDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
        const data = await res.json();

        if (!data?.data || data.data.length === 0) {
          setFundData(null);
          return;
        }

        if (!isMounted) return;
        setFundData(data);

        const sortedNavs = data.data
          .map((entry) => ({
            date: new Date(entry.date.split("-").reverse().join("-")),
            nav: parseFloat(entry.nav),
          }))
          .sort((a, b) => a.date - b.date);

        setProcessedNavData(sortedNavs);

        const latestDate = sortedNavs[sortedNavs.length - 1]?.date;

        if (!latestDate) {
          setChartData(null);
          return;
        }

        const getNAVBeforeDays = (days) => {
          const pastDate = new Date(latestDate);
          pastDate.setDate(pastDate.getDate() - days);
          return (
            [...sortedNavs]
              .reverse()
              .find((entry) => entry.date <= pastDate)?.nav || null
          );
        };

        const latestNAV = sortedNavs[sortedNavs.length - 1]?.nav;
        const growthPeriods = [7, 30, 90, 180, 365];
        const stats = growthPeriods.map((days) => {
          const pastNAV = getNAVBeforeDays(days);
          if (!pastNAV)
            return {
              period: days,
              growth: "N/A",
              returns: "N/A",
              growthValue: null,
            };

          const growthRate = ((latestNAV - pastNAV) / pastNAV) * 100;
          const investmentReturns = ((10000 / pastNAV) * latestNAV).toFixed(2);

          return {
            period: days,
            growth: `${growthRate.toFixed(2)}%`,
            returns: `₹${investmentReturns}`,
            growthValue: growthRate,
          };
        });

        if (isMounted) {
          setGrowthStats(stats);
        }

        const yearAgoDate = new Date(latestDate);
        yearAgoDate.setDate(yearAgoDate.getDate() - 365);
        const yearData = sortedNavs.filter(
          (entry) => entry.date >= yearAgoDate
        );

        if (yearData.length > 0) {
          // 1. Performance Score (1-5 stars)
          // Based on 1-year returns compared to inflation benchmark
          const yearStartNAV = yearData[0].nav;
          const yearEndNAV = yearData[yearData.length - 1].nav;
          const annualReturn =
            ((yearEndNAV - yearStartNAV) / yearStartNAV) * 100;

          let score;
          if (annualReturn < 0) score = 1; // Negative returns
          else if (annualReturn < 5) score = 2; // Below inflation
          else if (annualReturn < 10) score = 3; // Moderate returns
          else if (annualReturn < 15) score = 4; // Good returns
          else score = 5; // Excellent returns

          setPerformanceScore(score);
          setMetricsDetails((prev) => ({
            ...prev,
            performanceValue: annualReturn.toFixed(2),
          }));

          // 2. Stability Rating (Very Low to Very High)
          // Calculate price variations over the year
          const navValues = yearData.map((entry) => entry.nav);
          const mean = navValues.reduce((a, b) => a + b, 0) / navValues.length;
          const stdDev = Math.sqrt(
            navValues
              .map((x) => Math.pow(x - mean, 2))
              .reduce((a, b) => a + b, 0) / navValues.length
          );
          const variationCoeff = (stdDev / mean) * 100;

          let stability;
          if (variationCoeff < 1) stability = "Very High"; // < 1% variation
          else if (variationCoeff < 3) stability = "High"; // 1-3% variation
          else if (variationCoeff < 6) stability = "Moderate"; // 3-6% variation
          else if (variationCoeff < 10) stability = "Low"; // 6-10% variation
          else stability = "Very Low"; // > 10% variation

          setStabilityRating(stability);
          setMetricsDetails((prev) => ({
            ...prev,
            stabilityValue: variationCoeff.toFixed(2),
          }));

          // 3. Growth Trend (Strong Up to Strong Down)
          // Look at the trend over the last 90 days
          const threeMonthsAgo = new Date(latestDate);
          threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
          const threeMonthData = sortedNavs.filter(
            (entry) => entry.date >= threeMonthsAgo
          );

          if (threeMonthData.length > 0) {
            const startNAV = threeMonthData[0].nav;
            const endNAV = threeMonthData[threeMonthData.length - 1].nav;
            const threeMonthChange = ((endNAV - startNAV) / startNAV) * 100;

            let trend;
            if (threeMonthChange < -10) trend = "Strong Down"; // > 10% loss
            else if (threeMonthChange < -3) trend = "Down"; // 3-10% loss
            else if (threeMonthChange < 3) trend = "Neutral"; // -3% to +3%
            else if (threeMonthChange < 10) trend = "Up"; // 3-10% gain
            else trend = "Strong Up"; // > 10% gain

            setGrowthTrend(trend);
            setMetricsDetails((prev) => ({
              ...prev,
              trendValue: threeMonthChange.toFixed(2),
            }));
          }

          // 4. Risk Level (Low to High)
          const category = data.meta.scheme_category.toLowerCase();
          let risk;

          if (category.includes("equity") && category.includes("small"))
            risk = "High"; // Small-cap equity
          else if (category.includes("equity") && category.includes("mid"))
            risk = "Medium-High"; // Mid-cap equity
          else if (category.includes("equity"))
            risk = "Medium"; // Large-cap equity
          else if (category.includes("hybrid"))
            risk = "Medium-Low"; // Hybrid funds
          else if (category.includes("debt")) risk = "Low"; // Debt funds
          else risk = "Medium"; // Default

          setRiskLevel(risk);

          // 5. Consistency Score (percentage of positive days, simplified to a 1-10 scale)
          const dailyChanges = [];
          for (let i = 1; i < yearData.length; i++) {
            dailyChanges.push(yearData[i].nav - yearData[i - 1].nav);
          }
          const positiveChanges = dailyChanges.filter(
            (change) => change > 0
          ).length;
          const consistencyPercentage =
            (positiveChanges / dailyChanges.length) * 100;

          setConsistencyScore(Math.round(consistencyPercentage / 10));
          setMetricsDetails((prev) => ({
            ...prev,
            consistencyValue: consistencyPercentage.toFixed(1),
          }));
        }
      } catch (error) {
        console.error("Error fetching fund details:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFundDetails();
    return () => {
      isMounted = false; // Cleanup
    };
  }, [schemeCode]);

  useEffect(() => {
    if (!processedNavData || processedNavData.length === 0) return;

    const latestDate = new Date(
      processedNavData[processedNavData.length - 1].date
    );

    const cutoffDate = new Date(latestDate);
    cutoffDate.setDate(cutoffDate.getDate() - selectedPeriod);

    const filteredData = processedNavData.filter(
      (entry) => entry.date >= cutoffDate
    );

    if (filteredData.length === 0) {
      setChartData(null);
      return;
    }

    const newChartData = {
      labels: filteredData.map((entry) => entry.date.toLocaleDateString()),
      datasets: [
        {
          label: "NAV Trend",
          data: filteredData.map((entry) => entry.nav),
          borderColor: "#00a1ff",
          backgroundColor: "rgba(0, 161, 255, 0.2)",
          fill: true,
        },
      ],
    };

    setChartData(newChartData);
  }, [selectedPeriod, processedNavData]);

  const renderStars = (score) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={i <= score ? "text-yellow-400" : "text-gray-400"}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const renderConsistencyMeter = (score) => {
    const dots = [];
    for (let i = 1; i <= 10; i++) {
      dots.push(
        <span
          key={i}
          className={`inline-block w-2 h-2 mx-px rounded-full ${
            i <= score
              ? i <= 3
                ? "bg-red-400"
                : i <= 7
                ? "bg-yellow-400"
                : "bg-green-400"
              : "bg-gray-400"
          }`}
        />
      );
    }
    return dots;
  };

  const getColorClass = (value, type) => {
    if (type === "stability") {
      return value === "Very High" || value === "High"
        ? "text-green-400"
        : value === "Moderate"
        ? "text-yellow-400"
        : "text-red-400";
    } else if (type === "trend") {
      return value === "Strong Up" || value === "Up"
        ? "text-green-400"
        : value === "Neutral"
        ? "text-yellow-400"
        : "text-red-400";
    } else if (type === "risk") {
      return value === "Low" || value === "Medium-Low"
        ? "text-green-400"
        : value === "Medium"
        ? "text-yellow-400"
        : "text-red-400";
    }
    return "";
  };

  const getGrowthColorClass = (value) => {
    if (value === null || value === undefined) return "";
    return parseFloat(value) >= 0 ? "text-green-500" : "text-red-500";
  };

  const getMetricDescription = (type) => {
    switch (type) {
      case "performance":
        return {
          1: "Poor: Negative returns (< 0%)",
          2: "Below Average: Below inflation (0-5%)",
          3: "Average: Moderate returns (5-10%)",
          4: "Good: Strong returns (10-15%)",
          5: "Excellent: Very high returns (>15%)",
        };
      case "stability":
        return {
          "Very High": "Minimal price fluctuation (< 1% variation)",
          High: "Low price fluctuation (1-3% variation)",
          Moderate: "Average price fluctuation (3-6% variation)",
          Low: "High price fluctuation (6-10% variation)",
          "Very Low": "Extreme price fluctuation (>10% variation)",
        };
      case "trend":
        return {
          "Strong Up": "Very positive trend (>10% growth in 3 months)",
          Up: "Positive trend (3-10% growth in 3 months)",
          Neutral: "Sideways movement (-3% to +3% in 3 months)",
          Down: "Negative trend (-10% to -3% in 3 months)",
          "Strong Down": "Very negative trend (< -10% in 3 months)",
        };
      case "risk":
        return {
          Low: "Debt funds, liquid funds, overnight funds",
          "Medium-Low": "Hybrid funds, balanced funds",
          Medium: "Large-cap equity funds",
          "Medium-High": "Mid-cap equity funds",
          High: "Small-cap equity, sector/thematic funds",
        };
      default:
        return {};
    }
  };

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <h1 className="text-3xl font-bold mb-6">Fund Details</h1>

      {loading ? (
        <div className="flex justify-center items-center mt-10">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : fundData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Basic Details and Growth Statistics */}
            <div className="flex flex-col gap-6">
              {/* Basic Fund Details */}
              <div className="p-4 bg-accent rounded-lg shadow">
                <h2 className="text-xl font-semibold">Fund Information</h2>
                <div className="mt-3">
                  <h3 className="text-lg font-medium">
                    {fundData.meta.scheme_name}
                  </h3>
                  <p className="text-secondary mt-2">
                    Scheme Code: {fundData.meta.scheme_code}
                  </p>
                  <p className="text-secondary mt-1">
                    {fundData.meta.scheme_category}
                  </p>
                  <p className="text-secondary mt-1">
                    {fundData.meta.scheme_type}
                  </p>
                  <p className="text-primary text-lg font-semibold mt-3">
                    Latest NAV: ₹{fundData.data[0]?.nav || "N/A"}
                  </p>
                  <p className="text-secondary mt-1">
                    As of: {fundData.data[0]?.date || "N/A"}
                  </p>
                </div>
              </div>

              {/* Growth Statistics */}
              {growthStats && (
                <div className="p-4 bg-accent rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-3">
                    Growth Statistics
                  </h2>
                  <p className="text-sm text-gray-400 mb-3">
                    Returns on ₹10,000 investment
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {growthStats.map((stat, index) => (
                      <div
                        key={index}
                        className="p-3 bg-background rounded-lg shadow"
                      >
                        <p className="text-sm text-gray-400">
                          {stat.period} Days
                        </p>
                        <p
                          className={`text-lg font-semibold ${
                            stat.growthValue !== null
                              ? parseFloat(stat.growthValue) >= 0
                                ? "text-green-500"
                                : "text-red-500"
                              : ""
                          }`}
                        >
                          {stat.growth}
                        </p>
                        <p className="text-primary text-sm">
                          Investment: {stat.returns}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Fund Evaluation */}
            <div className="p-4 bg-accent rounded-lg shadow h-fit">
              <h2 className="text-xl font-semibold mb-4">Fund Evaluation</h2>

              {/* 1. Performance Score (Star Rating) */}
              <div className="mb-4 p-3 bg-background rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Performance</span>
                  <div className="text-xl flex items-center">
                    {performanceScore ? (
                      <>
                        <div className="mr-2">
                          {renderStars(performanceScore)}
                        </div>
                        <span
                          className={getGrowthColorClass(
                            metricsDetails.performanceValue
                          )}
                        >
                          ({metricsDetails.performanceValue}%)
                        </span>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Based on 1-year returns
                </p>
                {performanceScore && (
                  <div className="mt-2 text-xs text-gray-100 bg-gray-600 p-2 rounded">
                    {getMetricDescription("performance")[performanceScore]}
                  </div>
                )}
              </div>

              {/* 2. Stability Rating */}
              <div className="mb-4 p-3 bg-background rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Price Stability</span>
                  <div className="flex items-center">
                    <span
                      className={`font-bold ${getColorClass(
                        stabilityRating,
                        "stability"
                      )}`}
                    >
                      {stabilityRating || "N/A"}
                    </span>
                    {metricsDetails.stabilityValue && (
                      <span className="text-sm ml-2">
                        (CV: {metricsDetails.stabilityValue}%)
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  How much prices fluctuate
                </p>
                {stabilityRating && (
                  <div className="mt-2 text-xs text-gray-100 bg-gray-600 p-2 rounded">
                    {getMetricDescription("stability")[stabilityRating]}
                  </div>
                )}
              </div>

              {/* 3. Growth Trend */}
              <div className="mb-4 p-3 bg-background rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Recent Trend</span>
                  <div className="flex items-center">
                    <span
                      className={`font-bold ${getColorClass(
                        growthTrend,
                        "trend"
                      )}`}
                    >
                      {growthTrend || "N/A"}
                    </span>
                    {metricsDetails.trendValue && (
                      <span
                        className={`text-sm ml-2 ${getGrowthColorClass(
                          metricsDetails.trendValue
                        )}`}
                      >
                        ({metricsDetails.trendValue}%)
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Direction over last 3 months
                </p>
                {growthTrend && (
                  <div className="mt-2 text-xs text-gray-100 bg-gray-600 p-2 rounded">
                    {getMetricDescription("trend")[growthTrend]}
                  </div>
                )}
              </div>

              {/* 4. Risk Level */}
              <div className="mb-4 p-3 bg-background rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Risk Level</span>
                  <span
                    className={`font-bold ${getColorClass(riskLevel, "risk")}`}
                  >
                    {riskLevel || "N/A"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Based on fund category
                </p>
                {riskLevel && (
                  <div className="mt-2 text-xs text-gray-100 bg-gray-600 p-2 rounded">
                    {getMetricDescription("risk")[riskLevel]}
                  </div>
                )}
              </div>

              {/* 5. Consistency Score (Meter) */}
              <div className="p-3 bg-background rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400">Consistency</span>
                  <span className="text-sm">
                    {consistencyScore ? (
                      <>
                        {consistencyScore}/10
                        <span className="text-xs ml-1 text-gray-500">
                          ({metricsDetails.consistencyValue}% positive days)
                        </span>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  {consistencyScore
                    ? renderConsistencyMeter(consistencyScore)
                    : "N/A"}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  How often daily returns are positive
                </p>
              </div>
            </div>
          </div>
          {/* NAV Trend Chart */}
          {chartData && (
            <div className="my-8 p-4 bg-accent rounded-lg shadow">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  NAV Trend (Last {selectedPeriod} days)
                </h3>
                <select
                  className="bg-background text-text border border-gray-600 rounded px-3 py-1"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                >
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 3 Months</option>
                  <option value="180">Last 6 Months</option>
                  <option value="365">Last 1 Year</option>
                </select>
              </div>
              <div className="mt-4 h-64">
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        ticks: {
                          maxTicksLimit: 10,
                        },
                      },
                    },
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Showing data from {chartData.labels[0]} to{" "}
                {chartData.labels[chartData.labels.length - 1]}
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="text-red-500">Fund not found.</p>
      )}
    </div>
  );
};

export default FundDetails;
