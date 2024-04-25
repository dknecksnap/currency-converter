import { useEffect, useState } from "react";
import CurrencyDropdown from "./dropdown";
import SimpleHistoricalChart from "./simple-chart";
import CurrencyInfo from "./currency-info";
import TargetDropdown from "./target-dropdown";
import CurrencyAlert from "./currency-alert";
import {
  Grid,
  Container,
  Typography,
  Button,
  TextField,
  IconButton,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SwapHorizontalCircleIcon from "@mui/icons-material/SwapHorizontalCircle";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

const CurrencyConverter = () => {
  const [currencies, setCurrencies] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("PLN");
  const [selectedToCurrencies, setSelectedToCurrencies] = useState([
    { value: "USD", label: "USD" },
  ]);
  const [convertedAmounts, setConvertedAmounts] = useState({});
  const [converting, setConverting] = useState(false);
  const [threshold, setThreshold] = useState(1.12); // Default threshold value
  const [alertActive, setAlertActive] = useState(false); // State to control alert activation
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || ["PLN", "USD"]
  );

  // Fetch available currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch("https://api.frankfurter.app/currencies");
        const data = await res.json();
        console.log(data);

        setCurrencies(Object.keys(data));
        setCurrencyOptions(
          Object.keys(data).map((key) => ({ value: key, label: key }))
        );
      } catch (error) {
        console.error("Error Fetching", error);
      }
    };
    fetchCurrencies();
  }, []);

  const clearConversion = () => {
    setConvertedAmounts({});
  };

  // Convert currency
  const convertCurrency = async () => {
    if (!amount || selectedToCurrencies.length === 0) return;
    setConverting(true);
    try {
      const promises = selectedToCurrencies.map((option) =>
        fetch(
          `https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${option.value}`
        )
      );
      const responses = await Promise.all(promises);
      const data = await Promise.all(responses.map((res) => res.json()));

      const newConvertedAmounts = {};
      data.forEach((item, index) => {
        const toCurrency = selectedToCurrencies[index].value;
        newConvertedAmounts[toCurrency] = {
          rate: item.rates[toCurrency],
          baseAmount: amount, // Store the original amount used for conversion
          baseCurrency: fromCurrency, // Store the original currency used for conversion
        };
      });
      setConvertedAmounts(newConvertedAmounts);
    } catch (error) {
      console.error("Error Fetching", error);
    } finally {
      setConverting(false);
    }
  };

  // Handle favorite currencies
  const handleFavorite = (currency) => {
    const updatedFavorites = favorites.includes(currency)
      ? favorites.filter((fav) => fav !== currency)
      : [...favorites, currency];
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  // Swap currencies
  const swapCurrencies = () => {
    if (selectedToCurrencies.length > 0) {
      const newFromCurrency = selectedToCurrencies[0].value;
      const newSelectedToCurrencies = [
        { value: fromCurrency, label: fromCurrency },
      ];
      setFromCurrency(newFromCurrency);
      setSelectedToCurrencies(newSelectedToCurrencies);
    }
  };

  // Extract the currency codes from the selectedToCurrencies for the chart
  const comparisonCurrencies = selectedToCurrencies.map(
    (currency) => currency.value
  );

  // Render component
  return (
    <div>
      <Container maxWidth="xl">
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{ minHeight: "100vh" }}
        >
          <Grid
            item
            xs={12}
            md={4}
            className="firstGrid"
          >
            <Typography variant="h2" gutterBottom>
              Currency Converter
            </Typography>
            {/* First dropdown (fromCurrency) */}
            <CurrencyDropdown
              favorites={favorites}
              currencies={currencies}
              currency={fromCurrency}
              setCurrency={setFromCurrency}
              handleFavorite={handleFavorite}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                position: "relative",
                top: "0.5rem",
              }}
            >
              <IconButton
                color="primary"
                size="large"
                onClick={swapCurrencies}
                aria-label="swap"
              >
                <SwapHorizontalCircleIcon />
              </IconButton>
            </div>

            {/* Second dropdown (selectedToCurrencies) */}
            <TargetDropdown
              currencyOptions={currencyOptions}
              selectedToCurrencies={selectedToCurrencies}
              setSelectedToCurrencies={setSelectedToCurrencies}
              fromCurrency={fromCurrency}
              favorites={favorites}
              handleFavorite={handleFavorite}
            />
            {selectedToCurrencies.length > 1 && (
              <Alert
                style={{ position: "relative", bottom: "1rem" }}
                severity="warning"
              >
                Charts are normalized, the values may not be representative
              </Alert>
            )}
            <div>
              <TextField
                style={{ marginRight: "1rem", marginBottom: "0.5rem" }}
                id="outlined-number"
                placeholder="Amount"
                inputProps={{ min: 0 }}
                htmlFor="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              
              <Button
                className="convertButton"
                onClick={convertCurrency}
                variant="contained"
                endIcon={<ArrowForwardIosIcon />}
              >
                Convert
              </Button>
            </div>
            <div className="message">{Object.entries(convertedAmounts).map(([currency, conversion]) => (
              <div className="conversion" key={currency}>
                Converted: {conversion.baseAmount} {conversion.baseCurrency} ={" "}
                {conversion.rate.toFixed(2)} {currency}
              </div>
            ))}</div>
            <hr />
            {fromCurrency && selectedToCurrencies.length > 0 && (
              <CurrencyAlert
                clearConversion={clearConversion}
                fromCurrency={fromCurrency}
                toCurrency={selectedToCurrencies[0].value}
                threshold={threshold}
                setThreshold={setThreshold}
                alertActive={alertActive}
                setAlertActive={setAlertActive}
              />
            )}
          </Grid>
          <Grid item xs={12} md={8} className="chartInfo">
            <div className="wrapper">
              <div>
                {selectedToCurrencies.length > 0 && (
                  <SimpleHistoricalChart
                    baseCurrency={fromCurrency}
                    comparisonCurrencies={comparisonCurrencies}
                  />
                )}{" "}
              </div>
              {/* Conditional rendering for CurrencyInfo */}
              <div>
                {fromCurrency && <CurrencyInfo currencyCode={fromCurrency} />}
              </div>
            </div>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default CurrencyConverter;
