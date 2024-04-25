import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chart.js/auto";

// Register the required components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SimpleHistoricalChart = ({ baseCurrency, comparisonCurrencies }) => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const prevComparisonCurrenciesRef = useRef([]);
  const prevBaseCurrencyRef = useRef(baseCurrency);

  // Function to normalize an array of numbers using min-max normalization
  const minMaxNormalize = (data) => {
    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);

    // If all values are the same, return an array of ones
    if (minVal === maxVal) return data.map(() => 1);

    return data.map((value) => (value - minVal) / (maxVal - minVal));
  };

  // Function to generate a random color
  const generateRandomColor = () => {
    return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
      Math.random() * 255
    )}, ${Math.floor(Math.random() * 255)})`;
  };

  // Function to get the stored color or generate a new one if not present
  const getColorForCurrency = (currency) => {
    // Check if the color is stored in sessionStorage
    const storedColors =
      JSON.parse(sessionStorage.getItem("currencyColors")) || {};
    if (storedColors[currency]) {
      return storedColors[currency];
    } else {
      // Generate a new color and store it
      const newColor = generateRandomColor();
      storedColors[currency] = newColor;
      sessionStorage.setItem("currencyColors", JSON.stringify(storedColors));
      return newColor;
    }
  };

  useEffect(() => {
    const isNewCurrencyAdded = (prevCurrencies, newCurrencies) => {
      if (!prevCurrencies || prevCurrencies.length !== newCurrencies.length) {
        return true;
      }
      return newCurrencies.some(
        (currency, index) => currency !== prevCurrencies[index]
      );
    };

    const fetchHistoricalData = async () => {
      setLoading(true);
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(
        new Date().setFullYear(new Date().getFullYear() - 5)
      )
        .toISOString()
        .split("T")[0];

      try {
        const promises = comparisonCurrencies.map((currency) =>
          // Fetch monthly data for ranges larger than 90 days
          fetch(
            `https://api.frankfurter.app/${startDate}..${endDate}?from=${baseCurrency}&to=${currency}`
          )
        );
        const responses = await Promise.all(promises);
        const data = await Promise.all(responses.map((res) => res.json()));

        // Inside your fetchHistoricalData function, after fetching the data
        const datasets = data.map((dataset, index) => {
          const currency = comparisonCurrencies[index];
          const labels = Object.keys(dataset.rates);
          const values = labels.map((date) => {
            const rateForDate = dataset.rates[date];
            return rateForDate && rateForDate[comparisonCurrencies[index]]
              ? rateForDate[comparisonCurrencies[index]]
              : null;
          });

          // Normalize the values if there are multiple currencies
          const normalizedValues =
            comparisonCurrencies.length > 1 ? minMaxNormalize(values) : values;

          const borderColor = getColorForCurrency(currency);

          return {
            label: `Historical ${baseCurrency} Exchange Rate for ${comparisonCurrencies[index]}`,
            data: normalizedValues,
            fill: false,
            borderColor: borderColor,
            tension: 0.1,
          };
        });

        // Then set the chartData with the normalized datasets
        setChartData({
          labels: Object.keys(data[0].rates),
          datasets,
        });
      } catch (error) {
        console.error("Error fetching historical data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Check if the base currency has changed or a new currency has been added
    if (
      baseCurrency !== prevBaseCurrencyRef.current ||
      isNewCurrencyAdded(
        prevComparisonCurrenciesRef.current,
        comparisonCurrencies
      )
    ) {
      fetchHistoricalData();
    }

    // Update refs after the effect runs
    prevBaseCurrencyRef.current = baseCurrency;
    prevComparisonCurrenciesRef.current = comparisonCurrencies;
  }, [baseCurrency, comparisonCurrencies]);

  const options = {
    scales: {
      x: {
        type: "time",
        ticks: {
          autoSkip: true,
          maxTicksLimit: 20,
        },
        time: {
          parser: "yyyy-MM-dd", // Define the format of the date strings
          unit: "month",
          displayFormats: {
            month: "yyyy-MM",
          },
          maxTicks: 50,
        },
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Exchange Rate",
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="chart">
      {loading ? (
        <p>Loading chart...</p>
      ) : (
        <Line
          data={chartData}
          options={{
            scales: {
              y: {
                beginAtZero: false,
              },
            },
          }}
        />
      )}
    </div>
  );
};

export default SimpleHistoricalChart;
