import React, { useState, useEffect } from "react";
import { Button, Collapse, Paper, Typography } from "@mui/material";

// Mapping of currency codes to Wikipedia page titles
const currencyNameMap = {
  AUD: "Australian_dollar",
  BGN: "Bulgarian_lev",
  BRL: "Brazilian_real",
  CAD: "Canadian_dollar",
  CHF: "Swiss_franc",
  CNY: "Renminbi",
  CZK: "Czech_koruna",
  DKK: "Danish_krone",
  EUR: "Euro",
  GBP: "Pound_sterling",
  HKD: "Hong_Kong_dollar",
  HRK: "Croatian_kuna",
  HUF: "Hungarian_forint",
  IDR: "Indonesian_rupiah",
  ILS: "Israeli_new_shekel",
  INR: "Indian_rupee",
  ISK: "Icelandic_króna",
  JPY: "Japanese_yen",
  KRW: "South_Korean_won",
  MXN: "Mexican_peso",
  MYR: "Malaysian_ringgit",
  NOK: "Norwegian_krone",
  NZD: "New_Zealand_dollar",
  PHP: "Philippine_peso",
  PLN: "Polish_złoty",
  RON: "Romanian_leu",
  RUB: "Russian_ruble",
  SEK: "Swedish_krona",
  SGD: "Singapore_dollar",
  THB: "Thai_baht",
  TRY: "Turkish_lira",
  USD: "United_States_dollar",
  ZAR: "South_African_rand",
};

const CurrencyInfo = ({ currencyCode }) => {
  const [currencyInfo, setCurrencyInfo] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchCurrencyInfo = async () => {
      try {
        const fullCurrencyName = currencyNameMap[currencyCode] || currencyCode;
        const response = await fetch(
          `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=${fullCurrencyName}&origin=*`
        );
        const data = await response.json();
        const pageId = Object.keys(data.query.pages)[0];
        const extract = data.query.pages[pageId].extract;
        setCurrencyInfo(extract);
      } catch (error) {
        console.error("Error fetching currency information:", error);
      }
    };

    if (currencyCode) {
      fetchCurrencyInfo();
    }
  }, [currencyCode]);

  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <Paper className="info" elevation={3}>
      <Typography variant="h5" gutterBottom>
        About {currencyCode}
      </Typography>
      <Button
        variant="contained"
        onClick={handleToggle}
        style={{ marginBottom: "10px" }}
      >
        {open ? "Hide Details" : "Show Details"}
      </Button>
      <Collapse in={open}>
        <Typography
          variant="body1"
          dangerouslySetInnerHTML={{ __html: currencyInfo }}
        />
      </Collapse>
    </Paper>
  );
};

export default CurrencyInfo;
