import React, { useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import { Send } from "lucide-react";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import { fetchDataFromApi } from "../../utils/api";
import "./index.css";
const Slidebar = ({
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  ratingFilter,
  setRatingFilter,
  onApplyFilters,
}) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetchDataFromApi("/api/category");
        if (res?.categoryList) setCategories(res.categoryList);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handleRatingChange = (event) => {
    setRatingFilter(event.target.value);
  };

  const handleCategoryClick = (categoryId) => {
    console.log("Category clicked:", categoryId);
    setSelectedCategory(categoryId);
    // Remove setTimeout - let useEffect handle the filtering
  };

  const handleApplyFilters = () => {
    onApplyFilters();
  };

  return (
    <div className="slidebar p-2">
      {/* Category Card */}
      <div
        className="p-3 mb-3 border shadow-sm"
        style={{ borderRadius: "12px" }}
      >
        <h5 className="mb-3">Categories</h5>
        <div className="catList d-flex flex-column gap-2">
          <div
            className={`catItem p-2 rounded cursor-pointer transition-all ${
              selectedCategory === "all"
                ? "bg-success text-white"
                : "bg-light hover:bg-gray-100"
            }`}
            style={{
              cursor: "pointer",
              transition: "all 0.3s ease",
              border:
                selectedCategory === "all"
                  ? "2px solid #28a745"
                  : "1px solid #e9ecef",
            }}
            onClick={() => handleCategoryClick("all")}
          >
            <strong>All Products</strong>
          </div>
          {categories.map((cat) => (
            <div
              key={cat._id}
              className={`catItem p-2 rounded cursor-pointer transition-all ${
                selectedCategory === cat._id
                  ? "bg-success text-white"
                  : "bg-light hover:bg-gray-100"
              }`}
              style={{
                cursor: "pointer",
                transition: "all 0.3s ease",
                border:
                  selectedCategory === cat._id
                    ? "2px solid #28a745"
                    : "1px solid #e9ecef",
              }}
              onClick={() => handleCategoryClick(cat._id)}
            >
              {cat.name}
            </div>
          ))}
        </div>
      </div>

      {/* Filter Card */}
      <div className="p-3 border shadow-sm" style={{ borderRadius: "12px" }}>
        {/* Price Slider */}
        <h5 className="mb-3">Filter by Price</h5>
        <div className="px-2">
          <Slider
            min={0}
            max={1000}
            value={priceRange}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            color="success"
            sx={{
              "& .MuiSlider-thumb": {
                backgroundColor: "#28a745",
              },
              "& .MuiSlider-track": {
                backgroundColor: "#28a745",
              },
              "& .MuiSlider-rail": {
                backgroundColor: "#e9ecef",
              },
            }}
          />
        </div>
        <div className="d-flex justify-content-between mt-2 mb-4">
          <span className="badge bg-success">₹{priceRange[0]}</span>
          <span className="badge bg-success">₹{priceRange[1]}</span>
        </div>

        {/* Rating Filter */}
        <h5 className="mb-3">Filter by Rating</h5>
        <FormControl component="fieldset" className="w-100">
          <RadioGroup
            value={ratingFilter || ""}
            onChange={handleRatingChange}
            className="mb-3"
          >
            <FormControlLabel
              value=""
              control={<Radio color="success" />}
              label="All Ratings"
              className="mb-1"
            />
            {[5, 4, 3, 2, 1].map((rate) => (
              <FormControlLabel
                key={rate}
                value={rate.toString()}
                control={<Radio color="success" />}
                label={
                  <span className="d-flex align-items-center">
                    {rate} Stars & Up
                    <span className="ms-2">
                      {"★".repeat(rate)}
                      {"☆".repeat(5 - rate)}
                    </span>
                  </span>
                }
                className="mb-1"
              />
            ))}
          </RadioGroup>
        </FormControl>

        {/* Apply Filter Button */}
        <Button
          variant="contained"
          color="success"
          startIcon={<Send />}
          className="mt-3 w-100"
          onClick={handleApplyFilters}
          sx={{
            backgroundColor: "#28a745",
            "&:hover": {
              backgroundColor: "#218838",
            },
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: "bold",
          }}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default Slidebar;
