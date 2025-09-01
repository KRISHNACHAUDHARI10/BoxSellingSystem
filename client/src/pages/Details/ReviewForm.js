import React, { useState } from "react";
import {
  Rating,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import { postData } from "../../utils/api";

const ReviewForm = ({ productId, onReviewSubmitted, context }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    // Check if user is logged in
    if (!user || !user.userId) {
      setShowAlert({
        show: true,
        message: "Please login first to submit a review!",
        type: "error",
      });
      return;
    }

    // Validate rating
    if (rating === 0) {
      setShowAlert({
        show: true,
        message: "Please select a star rating!",
        type: "error",
      });
      return;
    }

    // Validate review text
    if (reviewText.trim().length < 10) {
      setShowAlert({
        show: true,
        message: "Please write at least 10 characters for your review!",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    const reviewData = {
      productId: productId,
      customerId: user.userId,
      customerName: user.name,
      review: reviewText.trim(),
      customerRating: rating,
    };

    try {
      const response = await postData("/api/productReviews/add", reviewData);

      if (response && !response.error) {
        setShowAlert({
          show: true,
          message: "Review submitted successfully!",
          type: "success",
        });

        // Reset form
        setRating(0);
        setReviewText("");

        // Call parent callback to refresh reviews
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }

        // Show success message in context if available
        if (context && context.setAlertBox) {
          context.setAlertBox({
            open: true,
            error: false,
            msg: "Review submitted successfully!",
          });
        }
      } else {
        setShowAlert({
          show: true,
          message:
            response?.msg || "Failed to submit review. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Review submission error:", error);
      setShowAlert({
        show: true,
        message: "Failed to submit review. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);

      // Hide alert after 5 seconds
      setTimeout(() => {
        setShowAlert({ show: false, message: "", type: "success" });
      }, 5000);
    }
  };

  return (
    <Box
      sx={{
        mt: 4,
        p: 3,
        border: "1px solid #e9ecef",
        borderRadius: "8px",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Typography
        variant="h6"
        sx={{ mb: 3, fontWeight: 600, color: "#2c3e50" }}
      >
        Write a Review
      </Typography>

      {showAlert.show && (
        <Alert
          severity={showAlert.type}
          sx={{ mb: 3 }}
          onClose={() =>
            setShowAlert({ show: false, message: "", type: "success" })
          }
        >
          {showAlert.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
            Rating *
          </Typography>
          <Rating
            name="product-rating"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
              // Clear error if rating is selected
              if (
                newValue > 0 &&
                showAlert.show &&
                showAlert.message.includes("star rating")
              ) {
                setShowAlert({ show: false, message: "", type: "success" });
              }
            }}
            size="large"
            precision={1}
          />
          {rating > 0 && (
            <Typography variant="body2" sx={{ mt: 1, color: "#6c757d" }}>
              You rated: {rating} star{rating > 1 ? "s" : ""}
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            label="Your Review *"
            multiline
            rows={4}
            value={reviewText}
            onChange={(e) => {
              setReviewText(e.target.value);
              // Clear error if text is sufficient
              if (
                e.target.value.trim().length >= 10 &&
                showAlert.show &&
                showAlert.message.includes("10 characters")
              ) {
                setShowAlert({ show: false, message: "", type: "success" });
              }
            }}
            placeholder="Share your thoughts about this product..."
            fullWidth
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#28a745",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#28a745",
                },
              },
            }}
          />
          <Typography variant="body2" sx={{ mt: 1, color: "#6c757d" }}>
            {reviewText.length}/500 characters (minimum 10 characters required)
          </Typography>
        </Box>

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{
            backgroundColor: "#28a745",
            color: "white",
            padding: "10px 30px",
            borderRadius: "25px",
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#218838",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
            },
            "&:disabled": {
              backgroundColor: "#6c757d",
            },
          }}
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </Box>
  );
};

export default ReviewForm;
