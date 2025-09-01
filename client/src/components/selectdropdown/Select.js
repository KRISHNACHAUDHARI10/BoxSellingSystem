import React, { useState, useEffect } from "react";
import "./select.css";
import { ChevronDown } from "lucide-react";
import ClickAwayListener from "@mui/material/ClickAwayListener";

const Select = ({ data = [], placeholder = "Select", icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedItem, setSelectedItem] = useState(placeholder);
  const [filteredList, setFilteredList] = useState(data);

  // ✅ Jab bhi data update hoga, list update ho jaye
  useEffect(() => {
    setFilteredList(data);
  }, [data]);

  // Dropdown toggle
  const toggleSelect = () => {
    setIsOpen((prev) => !prev);
    setFilteredList(data); // har baar open hone pe reset
  };

  // Item select
  const handleSelect = (index, item) => {
    setSelectedIndex(index);
    setIsOpen(false);

    // ✅ Priority: item.name (categories) ya item.label (countries)
    setSelectedItem(item.name || item.label || placeholder);
  };

  // Search filter
  const handleFilter = (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = data.filter((item) =>
      (item.name || item.label || "").toLowerCase().includes(keyword)
    );
    setFilteredList(filtered);
  };

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <div className="selectDropWrapper position-relative">
        {icon && icon}

        {/* Selected value */}
        <span
          className="openSelect d-flex align-items-center"
          onClick={toggleSelect}
        >
          {selectedItem.length > 14
            ? selectedItem.substring(0, 14) + "..."
            : selectedItem}
          <ChevronDown className="arrow ms-2" />
        </span>

        {/* Dropdown list */}
        {isOpen && (
          <div className="selectdrop">
            {/* Search field */}
            <div className="searchfield">
              <input
                type="text"
                placeholder="Search here..."
                onChange={handleFilter}
              />
            </div>

            {/* List */}
            <ul className="searchresult" role="listbox">
              {filteredList.length > 0 ? (
                filteredList.map((item, index) => (
                  <li
                    key={item._id || item.name || item.label}
                    onClick={() => handleSelect(index, item)}
                    className={selectedIndex === index ? "active" : ""}
                    role="option"
                    aria-selected={selectedIndex === index}
                  >
                    {item.name || item.label}
                  </li>
                ))
              ) : (
                <li className="no-results">No results found</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
};

export default Select;
