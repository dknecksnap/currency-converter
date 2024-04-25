import React, { useState, useEffect } from "react";
import {
  IconButton,
  Modal,
  Checkbox,
  TextField,
  Backdrop,
  Fade,
  Box,
  Typography,
} from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

const CurrencyAlert = ({
  fromCurrency,
  toCurrency,
  threshold,
  setThreshold,
  alertActive,
  setAlertActive,
  clearConversion,
}) => {
  const [open, setOpen] = useState(false);
  const [currentRate, setCurrentRate] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (fromCurrency && toCurrency && alertActive) {
        fetch(
          `https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`
        )
          .then((res) => res.json())
          .then((data) => {
            const rate = data.rates[toCurrency];
            setCurrentRate(rate);
            if (rate >= threshold) {
              setOpen(true);
            }
          })
          .catch((error) => console.error("Error:", error));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [fromCurrency, toCurrency, threshold, alertActive]);

  const handleClose = () => {
    setOpen(false);
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 450,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  return (
    <div>
      <p>
        Notify me when the currency reaches a set threshold <br />{" "}
        <span style={{ fontWeight: "bold" }}>
          (1 {fromCurrency} to {toCurrency})
        </span>
      </p>

      <TextField
        id="outlined-number"
        type="number"
        placeholder="Threshold"
        inputProps={{ min: 0 }}
        value={threshold}
        onChange={(e) => setThreshold(e.target.value)}
        InputLabelProps={{
          shrink: true,
        }}
      />

      <Checkbox
        checked={alertActive}
        onChange={(e) => setAlertActive(e.target.checked)}
        color="primary"
      />

      <IconButton onClick={clearConversion}>
        <DeleteRoundedIcon />
      </IconButton>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Typography id="transition-modal-title" variant="h6" component="h2">
              <span className="boldText">Alert!</span>
            </Typography>
            <Typography id="transition-modal-description" sx={{ mt: 2 }}>
              The rate of <span className="boldText">{fromCurrency}</span> to{" "}
              <span className="boldText">{toCurrency}</span> has reached the
              threshold of{" "}
              <span style={{ color: "green" }} className="boldText">
                {threshold}
              </span>
              .
            </Typography>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default CurrencyAlert;
