import React from "react";
import Select, { components } from "react-select";
import Button from '@mui/material/Button';
import GradeRoundedIcon from '@mui/icons-material/GradeRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';

const TargetDropdown = ({
  currencyOptions,
  selectedToCurrencies,
  setSelectedToCurrencies,
  fromCurrency,
  favorites,
  handleFavorite
}) => {
  const isFavorite = (curr) => favorites.includes(curr);

  // Filter out the selected 'fromCurrency' from the options
  const filteredOptions = currencyOptions.filter(
    (option) => option.value !== fromCurrency
  );

  // Include favorites in the options, ensuring 'fromCurrency' is not a favorite
  const favoriteOptions = favorites
    .filter((fav) => fav !== fromCurrency)
    .map((fav) => ({
      value: fav,
      label: fav,
      isFavorite: true,
    }));

  // Combine favorite options and filtered regular options
  const combinedOptions = [
    ...favoriteOptions,
    ...filteredOptions,
  ];

  // Remove duplicates by converting to a Set and back to an array
  const uniqueOptions = Array.from(new Set(combinedOptions.map((option) => option.value)))
    .map((value) => combinedOptions.find((option) => option.value === value));

  return (
    <div style={{ marginBottom: "1rem" }}>To:
      <Select
        isMulti
        options={uniqueOptions}
        value={selectedToCurrencies}
        onChange={setSelectedToCurrencies}
        className="currency-select"
        classNamePrefix="select"
        placeholder="Select target currencies..."
        components={{
          Option: (props) => (
            <components.Option {...props}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {props.data.label}
                <Button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the dropdown from closing
                    handleFavorite(props.data.value);
                  }}
                  style={{ background: 'transparent', minWidth: 'auto' }}
                >
                  {isFavorite(props.data.value) ? <GradeRoundedIcon /> : <StarOutlineRoundedIcon />}
                </Button>
              </div>
            </components.Option>
          ),
        }} // Use the custom Option component
      />
    </div>
  );
};

export default TargetDropdown;
