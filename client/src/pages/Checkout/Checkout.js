import React, { useContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import {
  FormControl,
  Button,
  CircularProgress,
  Skeleton,
  Alert,
} from "@mui/material";
import { MyContext } from "../../App";
import { fetchDataFromApi, postData, deleteData } from "../../utils/api";
import "./checkout.css";
import {
  IoBagCheckOutline,
  IoCardOutline,
  IoLocationOutline,
  IoCallOutline,
  IoMailOutline,
  IoArrowBackOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";

const Checkout = () => {
  const { countryList } = useContext(MyContext);
  const context = useContext(MyContext);
  const navigate = useNavigate();

  // Form state
  const [formFields, setFormFields] = useState({
    fullName: "",
    country: "",
    streetAddressLine1: "",
    streetAddressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    email: "",
  });

  // Cart and loading states
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Get current user
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  // Calculate order totals
  const orderCalculations = useMemo(() => {
    if (!cartItems || cartItems.length === 0) {
      return {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        itemCount: 0,
      };
    }

    const subtotal = cartItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + price * quantity;
    }, 0);

    // Calculate shipping (free for orders over ₹500, otherwise ₹50)
    const shipping = subtotal >= 500 ? 0 : 50;

    // Calculate tax (18% GST)
    const tax = subtotal * 0.18;

    const total = subtotal + shipping + tax;

    return {
      subtotal,
      shipping,
      tax,
      total,
      itemCount: cartItems.length,
    };
  }, [cartItems]);

  // Fetch cart data
  const getCartData = async () => {
    if (!currentUser?.userId) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchDataFromApi(
        `/api/cart?userId=${currentUser.userId}`
      );

      // Handle different API response formats
      let cartData = [];
      if (Array.isArray(res)) {
        cartData = res;
      } else if (res && Array.isArray(res.data)) {
        cartData = res.data;
      } else if (res && Array.isArray(res.cartItems)) {
        cartData = res.cartItems;
      } else if (res && res.success && Array.isArray(res.result)) {
        cartData = res.result;
      } else if (res && res.success && Array.isArray(res.data)) {
        cartData = res.data;
      }

      setCartItems(cartData);

      // If cart is empty, redirect to cart page
      if (cartData.length === 0) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Your cart is empty. Add some products first!",
        });
        navigate("/cart");
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Failed to load cart data",
      });
      navigate("/cart");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart after successful order
  const clearCart = async () => {
    try {
      // Clear cart items from backend
      const deletePromises = cartItems.map((item) =>
        deleteData(`/api/cart/${item._id}`)
      );
      await Promise.allSettled(deletePromises);

      // Clear context cart
      if (context.setCartItems) {
        context.setCartItems([]);
      }

      // Clear local cart state
      setCartItems([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
      // Even if clearing fails, we can continue - order was successful
    }
  };

  // Load cart data on component mount
  useEffect(() => {
    // First check if there's cart data in context
    if (context.cartItems && context.cartItems.length > 0) {
      setCartItems(context.cartItems);
      setIsLoading(false);
    } else {
      getCartData();
    }
  }, []);

  // Pre-fill form with user data if available
  useEffect(() => {
    if (currentUser) {
      setFormFields((prev) => ({
        ...prev,
        fullName: currentUser.name || "",
        email: currentUser.email || "",
        phoneNumber: currentUser.phone || "",
      }));
    }
  }, [currentUser]);

  // Handle form input changes
  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Form validation rules
  const validateForm = () => {
    const errors = {};

    // Required fields validation
    const requiredFields = {
      fullName: "Full Name is required",
      country: "Please select a country",
      streetAddressLine1: "Street address is required",
      city: "City is required",
      state: "State is required",
      zipCode: "ZIP code is required",
      phoneNumber: "Phone number is required",
      email: "Email address is required",
    };

    // Check required fields
    Object.keys(requiredFields).forEach((field) => {
      if (!formFields[field] || formFields[field].trim() === "") {
        errors[field] = requiredFields[field];
      }
    });

    // Email validation
    if (formFields.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formFields.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    // Phone number validation (basic)
    if (formFields.phoneNumber) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formFields.phoneNumber.replace(/\s/g, ""))) {
        errors.phoneNumber = "Please enter a valid phone number";
      }
    }

    // ZIP code validation (basic)
    if (formFields.zipCode) {
      const zipRegex = /^[\d]{4,10}$/;
      if (!zipRegex.test(formFields.zipCode)) {
        errors.zipCode = "Please enter a valid ZIP code";
      }
    }

    // Full name validation
    if (formFields.fullName) {
      if (formFields.fullName.length < 2) {
        errors.fullName = "Full name must be at least 2 characters";
      }
    }

    return errors;
  };

  // Handle form submission

  const handleCheckout = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please fix the form errors before proceeding",
      });
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Your cart is empty. Please add some products first.",
      });
      navigate("/cart");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order data matching backend expectations - CORRECTED
      const orderData = {
        userid: currentUser.userId, // Make sure this matches backend expectation
        items: cartItems,
        shippingAddress: {
          fullName: formFields.fullName,
          streetAddressLine1: formFields.streetAddressLine1,
          streetAddressLine2: formFields.streetAddressLine2,
          city: formFields.city,
          state: formFields.state,
          zipCode: formFields.zipCode,
          country: formFields.country,
          phoneNumber: formFields.phoneNumber,
        },
        email: formFields.email,
        subtotal: orderCalculations.subtotal,
        shipping: orderCalculations.shipping,
        tax: orderCalculations.tax,
        total: orderCalculations.total,
        orderDate: new Date().toISOString(),
      };

      console.log("Order data being sent:", JSON.stringify(orderData, null, 2));

      // Payment integration with Razorpay
      const razorpayOptions = {
        key: "rzp_test_RAqEudtl92pUwy", // Replace with your actual Razorpay key
        amount: Math.round(orderCalculations.total * 100), // Amount in paise
        currency: "INR",
        name: "E-Bharat",
        description: "Order Payment",
        handler: async function (response) {
          console.log("Payment successful:", response);

          try {
            // Payment successful - add payment details to order data
            const finalOrderData = {
              ...orderData,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            };

            console.log(
              "Final order data with payment:",
              JSON.stringify(finalOrderData, null, 2)
            );

            // Submit order to backend
            try {
              const orderResponse = await postData(
                "/api/orders",
                finalOrderData
              );
              console.log("Order response:", orderResponse);

              // Check for successful response
              if (orderResponse && orderResponse.success !== false) {
                // Order created successfully
                setOrderSuccess(true);

                // Clear cart after successful order
                await clearCart();

                // Show success message
                context.setAlertBox({
                  open: true,
                  error: false,
                  msg: "Order placed successfully!",
                });

                // Redirect to orders page after delay
                setTimeout(() => {
                  navigate("/orders");
                }, 3000);
              } else {
                throw new Error(
                  orderResponse?.message || "Failed to create order"
                );
              }
            } catch (apiError) {
              console.error("API Error Details:", apiError);

              let errorMessage = "Order creation failed. ";

              if (apiError.response) {
                // Server responded with error status
                errorMessage += `Server error (${apiError.response.status}): ${
                  apiError.response.data?.message ||
                  apiError.response.statusText
                }`;
              } else if (apiError.request) {
                // Request was made but no response received
                errorMessage +=
                  "No response from server. Please check your internet connection.";
              } else {
                // Something else happened
                errorMessage += apiError.message;
              }

              errorMessage += ` Please contact support with your payment ID: ${response.razorpay_payment_id}`;

              throw new Error(errorMessage);
            }
          } catch (error) {
            console.error("Order creation failed:", error);
            setIsSubmitting(false);
            context.setAlertBox({
              open: true,
              error: true,
              msg: error.message,
            });
          }
        },
        prefill: {
          name: formFields.fullName,
          email: formFields.email,
          contact: formFields.phoneNumber,
        },
        theme: {
          color: "#2e7d32",
        },
        modal: {
          ondismiss: function () {
            console.log("Payment modal dismissed");
            setIsSubmitting(false);
          },
        },
      };

      // Function to load Razorpay and open payment
      const loadRazorpay = () => {
        return new Promise((resolve, reject) => {
          if (window.Razorpay) {
            resolve(window.Razorpay);
            return;
          }

          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => {
            if (window.Razorpay) {
              resolve(window.Razorpay);
            } else {
              reject(new Error("Razorpay SDK failed to load"));
            }
          };
          script.onerror = () => {
            reject(new Error("Failed to load Razorpay SDK"));
          };
          document.body.appendChild(script);
        });
      };

      // Load and open Razorpay
      try {
        const Razorpay = await loadRazorpay();
        const razorpay = new Razorpay(razorpayOptions);
        razorpay.open();
      } catch (error) {
        console.error("Failed to load Razorpay:", error);
        setIsSubmitting(false);
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Payment gateway failed to load. Please try again.",
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setIsSubmitting(false);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Something went wrong. Please try again.",
      });
    }
  };

  // Success message component
  if (orderSuccess) {
    return (
      <section className="checkout-section">
        <div className="checkout-container">
          <div
            className="section-card"
            style={{
              textAlign: "center",
              padding: "3rem",
              maxWidth: "500px",
              margin: "2rem auto",
              backgroundColor: "#f8f9fa",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            <IoCheckmarkCircle size={64} color="#2e7d32" />
            <h2 style={{ color: "#2e7d32", margin: "1rem 0" }}>
              Order Placed Successfully!
            </h2>
            <p style={{ color: "#666", marginBottom: "2rem" }}>
              Thank you for your purchase. You will be redirected to your orders
              page shortly.
            </p>
            <CircularProgress style={{ color: "#2e7d32" }} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-section">
      <div className="checkout-container">
        <div className="checkout-header">
          <Button
            variant="outlined"
            onClick={() => navigate("/cart")}
            startIcon={<IoArrowBackOutline />}
            style={{
              marginBottom: "20px",
              color: "#333",
              borderColor: "#333",
            }}
          >
            Back to Cart
          </Button>
          <h1 className="checkout-title">Secure Checkout</h1>
          <p className="checkout-subtitle">
            Complete your order safely and securely
          </p>
        </div>

        <form className="checkout-form" onSubmit={handleCheckout}>
          <div className="checkout-grid">
            {/* Left Side - Billing Details */}
            <div className="billing-section">
              <div className="section-card">
                <div className="section-header">
                  <IoLocationOutline className="section-icon" />
                  <h3 className="section-title">BILLING DETAILS</h3>
                </div>

                <div className="form-content">
                  <div className="form-row">
                    <div className="form-group">
                      <TextField
                        label="Full Name"
                        variant="outlined"
                        fullWidth
                        required
                        className="custom-input"
                        name="fullName"
                        value={formFields.fullName}
                        onChange={onChangeInput}
                        error={!!formErrors.fullName}
                        helperText={formErrors.fullName}
                      />
                    </div>
                    <div className="form-group">
                      <FormControl
                        fullWidth
                        className="custom-input"
                        error={!!formErrors.country}
                        required
                      >
                        <InputLabel id="country-select-label">
                          Country
                        </InputLabel>
                        <Select
                          labelId="country-select-label"
                          id="country-select"
                          label="Country"
                          value={formFields.country}
                          name="country"
                          onChange={onChangeInput}
                        >
                          {countryList?.length > 0 ? (
                            countryList.map((item, index) => (
                              <MenuItem value={item.value} key={index}>
                                {item.label}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>Loading countries...</MenuItem>
                          )}
                        </Select>
                        {formErrors.country && (
                          <span
                            style={{
                              color: "#d32f2f",
                              fontSize: "0.75rem",
                              marginTop: "3px",
                              marginLeft: "14px",
                              display: "block",
                            }}
                          >
                            {formErrors.country}
                          </span>
                        )}
                      </FormControl>
                    </div>
                  </div>

                  <div className="address-section">
                    <h4 className="subsection-title">Street Address</h4>
                    <div className="form-group">
                      <TextField
                        label="House number and street name"
                        variant="outlined"
                        fullWidth
                        required
                        className="custom-input"
                        name="streetAddressLine1"
                        value={formFields.streetAddressLine1}
                        onChange={onChangeInput}
                        error={!!formErrors.streetAddressLine1}
                        helperText={formErrors.streetAddressLine1}
                      />
                    </div>
                    <div className="form-group">
                      <TextField
                        label="Apartment, suite, unit, etc. (optional)"
                        variant="outlined"
                        fullWidth
                        name="streetAddressLine2"
                        className="custom-input"
                        value={formFields.streetAddressLine2}
                        onChange={onChangeInput}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <TextField
                        label="City"
                        variant="outlined"
                        fullWidth
                        required
                        name="city"
                        className="custom-input"
                        value={formFields.city}
                        onChange={onChangeInput}
                        error={!!formErrors.city}
                        helperText={formErrors.city}
                      />
                    </div>
                    <div className="form-group">
                      <TextField
                        label="State"
                        variant="outlined"
                        fullWidth
                        required
                        className="custom-input"
                        name="state"
                        value={formFields.state}
                        onChange={onChangeInput}
                        error={!!formErrors.state}
                        helperText={formErrors.state}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <TextField
                      label="ZIP CODE"
                      variant="outlined"
                      name="zipCode"
                      fullWidth
                      required
                      className="custom-input zip-input"
                      value={formFields.zipCode}
                      onChange={onChangeInput}
                      error={!!formErrors.zipCode}
                      helperText={formErrors.zipCode}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group contact-group">
                      <div className="input-with-icon">
                        <IoCallOutline className="input-icon" />
                        <TextField
                          label="PHONE NUMBER"
                          variant="outlined"
                          fullWidth
                          required
                          name="phoneNumber"
                          className="custom-input"
                          value={formFields.phoneNumber}
                          onChange={onChangeInput}
                          error={!!formErrors.phoneNumber}
                          helperText={formErrors.phoneNumber}
                        />
                      </div>
                    </div>
                    <div className="form-group contact-group">
                      <div className="input-with-icon">
                        <IoMailOutline className="input-icon" />
                        <TextField
                          label="EMAIL ADDRESS"
                          variant="outlined"
                          fullWidth
                          required
                          type="email"
                          name="email"
                          className="custom-input"
                          value={formFields.email}
                          onChange={onChangeInput}
                          error={!!formErrors.email}
                          helperText={formErrors.email}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Order Summary */}
            <div className="order-section">
              {isLoading ? (
                <div className="order-card">
                  <div className="order-header">
                    <IoCardOutline className="order-icon" />
                    <h4 className="order-title">YOUR ORDER</h4>
                  </div>
                  <div className="order-content">
                    <div className="order-items">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="order-item">
                          <div className="item-details">
                            <Skeleton variant="text" width="80%" height={20} />
                            <Skeleton variant="text" width="40%" height={16} />
                          </div>
                          <Skeleton variant="text" width="20%" height={20} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="order-card">
                  <div className="order-header">
                    <IoCardOutline className="order-icon" />
                    <h4 className="order-title">YOUR ORDER</h4>
                  </div>

                  <div className="order-content">
                    <div className="order-items">
                      {cartItems.map((item) => (
                        <div key={item._id} className="order-item">
                          <div className="item-details">
                            <span className="item-name">
                              {item.productTitle?.length > 25
                                ? item.productTitle.substring(0, 25) + "..."
                                : item.productTitle}
                            </span>
                            <span className="item-quantity">
                              x{item.quantity}
                            </span>
                            {item.selectedSize && (
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "0.8rem",
                                  color: "#666",
                                  marginTop: "2px",
                                }}
                              >
                                Size: {item.selectedSize}
                              </span>
                            )}
                          </div>
                          <span className="item-price">
                            ₹
                            {(
                              parseFloat(item.price) * parseInt(item.quantity)
                            ).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="order-summary">
                      <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{orderCalculations.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Shipping</span>
                        <span
                          style={{
                            color:
                              orderCalculations.shipping === 0
                                ? "#2e7d32"
                                : "inherit",
                            fontWeight:
                              orderCalculations.shipping === 0
                                ? "bold"
                                : "normal",
                          }}
                        >
                          {orderCalculations.shipping === 0
                            ? "FREE"
                            : `₹${orderCalculations.shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="summary-row">
                        <span>Tax (GST 18%)</span>
                        <span>₹{orderCalculations.tax.toFixed(2)}</span>
                      </div>
                      <div className="summary-row total-row">
                        <span>Total</span>
                        <span>₹{orderCalculations.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {orderCalculations.subtotal > 0 &&
                      orderCalculations.subtotal < 500 && (
                        <Alert severity="info" style={{ marginBottom: "20px" }}>
                          Add ₹{(500 - orderCalculations.subtotal).toFixed(2)}{" "}
                          more to get FREE shipping!
                        </Alert>
                      )}

                    <Button
                      className="checkout-button"
                      type="submit"
                      disabled={
                        isSubmitting || isLoading || cartItems.length === 0
                      }
                      fullWidth
                      variant="contained"
                      size="large"
                      style={{
                        backgroundColor: isSubmitting ? "#ccc" : "#2e7d32",
                        color: "white",
                        padding: "15px",
                        fontSize: "16px",
                        fontWeight: "600",
                        marginBottom: "15px",
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <CircularProgress
                            size={20}
                            color="inherit"
                            style={{ marginRight: "10px" }}
                          />
                          Processing Order...
                        </>
                      ) : (
                        <>
                          <IoBagCheckOutline style={{ marginRight: "8px" }} />
                          Complete Order - ₹{orderCalculations.total.toFixed(2)}
                        </>
                      )}
                    </Button>

                    <div
                      style={{
                        textAlign: "center",
                        fontSize: "12px",
                        color: "#666",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                      }}
                    >
                      🔒 Secure SSL encrypted payment
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Checkout;
