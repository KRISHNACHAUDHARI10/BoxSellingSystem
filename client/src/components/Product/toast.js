import React from "react";
import { toast } from "react-toastify";
import Button from "@mui/material/Button";

// Test component to verify toast is working
const ToastTest = () => {
  const testToasts = () => {
    // Success toast
    toast.success("✅ Success: Added to watchlist successfully! 💚", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });

    // Info toast after 1 second
    setTimeout(() => {
      toast.info("ℹ️ Info: Item already in watchlist!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
    }, 1000);

    // Warning toast after 2 seconds
    setTimeout(() => {
      toast.warning("⚠️ Warning: Please check your input", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }, 2000);

    // Error toast after 3 seconds
    setTimeout(() => {
      toast.error("❌ Error: Failed to add to watchlist", {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
      });
    }, 3000);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h3>Toast Notification Test</h3>
      <p>
        Click the button below to test if toast notifications are working
        properly.
      </p>
      <Button
        variant="contained"
        color="primary"
        onClick={testToasts}
        style={{ margin: "10px" }}
      >
        Test All Toast Types
      </Button>
    </div>
  );
};

export default ToastTest;
