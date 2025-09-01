import { useEffect, useContext, useState } from "react";
import { MyContext } from "../../App";
import "./index.css";

const Quantitybox = (props) => {
  const [inputVal, setInputVal] = useState(1);
  const context = useContext(MyContext);

  // Update local state when props.value changes
  useEffect(() => {
    if (
      props?.value !== undefined &&
      props?.value !== null &&
      props?.value !== ""
    ) {
      const newValue = parseInt(props.value);
      if (!isNaN(newValue) && newValue > 0) {
        setInputVal(newValue);
      }
    }
  }, [props.value]);

  const minus = () => {
    if (inputVal > 1) {
      const newValue = inputVal - 1;
      setInputVal(newValue);

      // Clear any existing alerts
      if (context.setAlertBox) {
        context.setAlertBox({ open: false });
      }

      // Notify parent component immediately
      if (props.quantity) {
        props.quantity(newValue);
      }
      if (props.selectedItem) {
        props.selectedItem(props.item, newValue);
      }
    }
  };

  const plus = () => {
    const stock = parseInt(props.item?.countInStock || 999);

    if (inputVal < stock) {
      const newValue = inputVal + 1;
      setInputVal(newValue);

      // Clear any existing alerts
      if (context.setAlertBox) {
        context.setAlertBox({ open: false });
      }

      // Notify parent component immediately
      if (props.quantity) {
        props.quantity(newValue);
      }
      if (props.selectedItem) {
        props.selectedItem(props.item, newValue);
      }
    } else {
      // Show stock limit alert
      if (context.setAlertBox) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: `Only ${stock} items available in stock`,
        });
      }
    }
  };

  // Handle direct input change
  const handleInputChange = (e) => {
    const value = e.target.value;

    // Allow empty string for editing
    if (value === "") {
      setInputVal("");
      return;
    }

    const numValue = parseInt(value);
    const stock = parseInt(props.item?.countInStock || 999);

    if (!isNaN(numValue)) {
      if (numValue < 1) {
        setInputVal(1);
        if (props.quantity) props.quantity(1);
        if (props.selectedItem) props.selectedItem(props.item, 1);
      } else if (numValue > stock) {
        setInputVal(stock);
        if (props.quantity) props.quantity(stock);
        if (props.selectedItem) props.selectedItem(props.item, stock);

        if (context.setAlertBox) {
          context.setAlertBox({
            open: true,
            error: true,
            msg: `Only ${stock} items available in stock`,
          });
        }
      } else {
        setInputVal(numValue);
        if (props.quantity) props.quantity(numValue);
        if (props.selectedItem) props.selectedItem(props.item, numValue);
      }
    }
  };

  // Handle input blur (when user finishes editing)
  const handleInputBlur = () => {
    if (inputVal === "" || inputVal < 1) {
      setInputVal(1);
      if (props.quantity) props.quantity(1);
      if (props.selectedItem) props.selectedItem(props.item, 1);
    }
  };

  const stock = parseInt(props.item?.countInStock || 999);
  const isMinusDisabled = inputVal <= 1 || props.disabled;
  const isPlusDisabled = inputVal >= stock || props.disabled;

  return (
    <div className="quantity-selector">
      <button
        className="quantity-btn"
        onClick={minus}
        disabled={isMinusDisabled}
        type="button"
      >
        −
      </button>

      {/* Make quantity editable */}
      <input
        type="number"
        className="quantity-input"
        value={inputVal}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        min="1"
        max={stock}
        disabled={props.disabled}
        style={{
          width: "60px",
          textAlign: "center",
          border: "1px solid #ddd",
          borderLeft: "none",
          borderRight: "none",
          padding: "8px 4px",
          fontSize: "14px",
          fontWeight: "600",
        }}
      />

      <button
        className="quantity-btn"
        onClick={plus}
        disabled={isPlusDisabled}
        type="button"
      >
        +
      </button>

      {/* Show stock info */}
    </div>
  );
};

export default Quantitybox;
