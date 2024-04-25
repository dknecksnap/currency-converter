import React from 'react';
import Select, { components } from 'react-select';
import Button from '@mui/material/Button';
import GradeRoundedIcon from '@mui/icons-material/GradeRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';

const CurrencyDropdown = ({
  currencies,
  currency,
  setCurrency,
  favorites,
  handleFavorite,
  title = "",
}) => {
  const isFavorite = (curr) => favorites.includes(curr);

  // Custom Option component to include the favorite button
  const Option = (props) => (
    <components.Option {...props}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {props.data.label}
        <Button
          onClick={(e) => {
            e.stopPropagation(); // Prevent the dropdown from closing
            handleFavorite(props.data.value);
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {isFavorite(props.data.value) ? <GradeRoundedIcon /> : <StarOutlineRoundedIcon />}
        </Button>
      </div>
    </components.Option>
  );

  // Create an options array for react-select
  const options = [
    ...favorites.map((favCurrency) => ({ value: favCurrency, label: favCurrency })),
    ...currencies
      .filter((curr) => !favorites.includes(curr))
      .map((currCurrency) => ({ value: currCurrency, label: currCurrency })),
  ];

  // Handle selection
  const handleChange = (selectedOption) => {
    setCurrency(selectedOption.value);
  };

  return (
    <div>
      <label htmlFor={title}>{title}</label>
      From:
      <Select
        value={options.find(option => option.value === currency)}
        onChange={handleChange}
        options={options}
        className="currency-select"
        classNamePrefix="select"
        components={{ Option }} // Use the custom Option component
      />
    </div>
  );
};

export default CurrencyDropdown;
