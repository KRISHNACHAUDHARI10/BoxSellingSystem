import React, { useState } from "react";
import "./style.css";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import Button from "@mui/material/Button";
import { postData } from "../../utils/api"; // Your existing API utility

const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', null
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setStatus(null);
    setMessage("");

    try {
      const response = await postData("/api/newsletter/subscribe", {
        email: email.trim().toLowerCase(),
      });

      if (response.success) {
        setStatus("success");
        setMessage(response.message || "Successfully subscribed!");
        setEmail(""); // Clear the input
      } else {
        setStatus("error");
        setMessage(response.message || "Subscription failed");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);

      // Handle different error scenarios
      if (error.response?.status === 409) {
        setStatus("error");
        setMessage("Email is already subscribed to our newsletter");
      } else if (error.response?.data?.message) {
        setStatus("error");
        setMessage(error.response.data.message);
      } else {
        setStatus("error");
        setMessage("Failed to subscribe. Please try again later.");
      }
    } finally {
      setLoading(false);

      // Clear status after 5 seconds
      setTimeout(() => {
        setStatus(null);
        setMessage("");
      }, 5000);
    }
  };

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    // Clear status when user starts typing
    if (status) {
      setStatus(null);
      setMessage("");
    }
  };

  return (
    <>
      <div className="newLetterBanner">
        <form onSubmit={handleSubmit} className="inputWrapper">
          <Send
            className={`sendIcon ${status === "success" ? "success" : ""}`}
          />
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={handleInputChange}
            disabled={loading}
            className={
              status === "error"
                ? "error"
                : status === "success"
                ? "success"
                : ""
            }
          />
          <Button
            type="submit"
            className={`bg-g subscribeBtn ${loading ? "loading" : ""}`}
            disabled={loading || !email.trim()}
          >
            {loading ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>

        {/* Status Message */}
        {status && message && (
          <div className={`statusMessage ${status}`}>
            {status === "success" ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{message}</span>
          </div>
        )}
      </div>
    </>
  );
};

export default NewsletterForm;
