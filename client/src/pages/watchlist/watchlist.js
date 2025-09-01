// src/components/Watchlist.js

import React, { useState, useEffect, useCallback } from "react";
import "./watchlist.css";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faHeart,
  faCartShopping,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

const Watchlist = () => {
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- THIS FUNCTION IS NOW FIXED ---
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    // FIX: Add `user?.userId` to the check to match your user object
    return user?._id || user?.id || user?.userId;
  };

  const userId = getUserId();

  const fetchWatchlist = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/watchlist/${userId}`);
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      const data = await response.json();
      if (data.success) {
        setWatchlistItems(data.data);
      } else {
        toast.error(data.message || "Failed to load watchlist.");
      }
    } catch (error) {
      console.error("Fetch watchlist error:", error);
      toast.error("Failed to load watchlist. Server might be down.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const deleteItem = async (itemId) => {
    try {
      const response = await fetch(`${API_URL}/api/watchlist/${itemId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setWatchlistItems((prevItems) =>
          prevItems.filter((item) => item._id !== itemId)
        );
        toast.success("Item removed from watchlist!");
      } else {
        toast.error(data.message || "Failed to remove item.");
      }
    } catch (error) {
      console.error("Delete item error:", error);
      toast.error("Failed to remove item.");
    }
  };

  const clearAllItems = async () => {
    if (
      window.confirm("Are you sure you want to clear your entire watchlist?")
    ) {
      try {
        const response = await fetch(
          `${API_URL}/api/watchlist/clear/${userId}`,
          {
            method: "DELETE",
          }
        );
        const data = await response.json();
        if (data.success) {
          setWatchlistItems([]);
          toast.success("Watchlist cleared successfully!");
        } else {
          toast.error(data.message || "Failed to clear watchlist.");
        }
      } catch (error) {
        console.error("Clear watchlist error:", error);
        toast.error("Failed to clear watchlist.");
      }
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading watchlist...</div>;
  }

  if (!userId) {
    return (
      <div className="empty-watchlist">
        <FontAwesomeIcon icon={faHeart} className="empty-heart-icon" />
        <h2>Please Log In</h2>
        <p>You need to be logged in to view your watchlist.</p>
        <Link to="/login">
          <Button variant="contained" color="success">
            Go to Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="watchlist-container">
      <div className="watchlist-header">
        <h1 className="watchlist-title">
          <FontAwesomeIcon icon={faHeart} className="heart-icon" /> My Watchlist
        </h1>
        {watchlistItems.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            onClick={clearAllItems}
            className="clear-all-btn"
          >
            Clear All ({watchlistItems.length})
          </Button>
        )}
      </div>

      {watchlistItems.length === 0 ? (
        <div className="empty-watchlist">
          <FontAwesomeIcon icon={faHeart} className="empty-heart-icon" />
          <h2>Your watchlist is empty</h2>
          <p>Save items you're interested in to view them here.</p>
          <Link to="/">
            <Button variant="contained" color="success">
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="watchlist-table-container">
          <table className="watchlist-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Title</th>
                <th>Brand</th>
                <th>Rating</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlistItems.map((item) => (
                <tr key={item._id} className="watchlist-item">
                  <td className="product-image-cell">
                    <img
                      src={item.images[0]}
                      alt={item.productTitle}
                      className="product-image"
                    />
                  </td>
                  <td className="product-title-cell">
                    <Link
                      to={`/product/${item.productId}`}
                      className="product-link"
                    >
                      {item.productTitle}
                    </Link>
                  </td>
                  <td className="brand-cell">
                    <span className="brand-name">{item.brand || "N/A"}</span>
                  </td>
                  <td className="rating-cell">
                    <Rating
                      value={item.rating}
                      precision={0.5}
                      readOnly
                      size="small"
                    />
                    <span className="rating-text">({item.rating})</span>
                  </td>
                  <td className="price-cell">
                    <div className="price-container">
                      <span className="current-price">₹{item.price}</span>
                      {item.oldPrice && (
                        <span className="old-price">₹{item.oldPrice}</span>
                      )}
                    </div>
                  </td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        className="add-to-cart-btn"
                      >
                        <FontAwesomeIcon icon={faCartShopping} />
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => deleteItem(item._id)}
                        className="delete-btn"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
