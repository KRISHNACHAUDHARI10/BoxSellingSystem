// === COMPLETE Products.js ===
import React, { useContext } from "react";
import "./style.css";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faHeart } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { IoEye } from "react-icons/io5";
import { toast } from "react-toastify";
import { postData } from "../../utils/api";
import { MyContext } from "../../App";

const Products = ({ item, tag }) => {
  const { refreshWatchlist, setAlertBox } = useContext(MyContext);

  if (!item) return null;

  // --- Data Sanitization ---
  const productId = item._id || item.id;
  const productName = item.name || "Unnamed Product";
  const productDescription = item.description || "No description available.";
  const productImage =
    (item.images && item.images[0]) || "/default-product.jpg";

  // --- User ID Management ---
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?._id || user?.id || user?.userId;
  };

  const addToWatchlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const userId = getUserId();
    if (!userId) {
      setAlertBox({
        open: true,
        error: true,
        msg: "Please log in to add items to your watchlist.",
      });
      return;
    }

    // Show loading toast
    const toastId = toast.info("Adding to watchlist...", {
      autoClose: false,
      position: "top-right",
    });

    try {
      const watchlistData = {
        productTitle: productName,
        images: item.images || [productImage],
        rating: parseFloat(item.rating) || 0,
        price: item.price,
        productId: productId,
        userId: userId,
        brand: item.brand || "N/A",
        oldPrice: item.oldPrice || null,
      };

      const response = await postData("/api/watchlist/add", watchlistData);
      toast.dismiss(toastId);

      if (response && response.success) {
        // SUCCESS: Show success toast
        toast.success("Added to watchlist successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            background: "#4caf50",
            color: "white",
            fontWeight: "500",
          },
        });

        // CRITICAL: Refresh watchlist to update header count immediately
        refreshWatchlist();
      } else {
        throw new Error(response.message || "Failed to add to watchlist");
      }
    } catch (error) {
      toast.dismiss(toastId);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Could not connect to the server.";

      console.error("Failed to add to watchlist:", errorMessage);

      if (errorMessage.includes("already in watchlist")) {
        toast.warning("Item is already in your watchlist!", {
          position: "top-right",
          autoClose: 3000,
          style: {
            background: "#ff9800",
            color: "white",
          },
        });
      } else {
        toast.error(`Error: ${errorMessage}`, {
          position: "top-right",
          autoClose: 4000,
          style: {
            background: "#f44336",
            color: "white",
          },
        });
      }
    }
  };

  return (
    <div className="productThumb">
      {tag && <span className={`badge ${tag}`}>{tag}</span>}

      <Link to={`/details/${productId}`}>
        <div className="imgWrapper">
          <img src={productImage} className="w-100" alt={productName} />
          <div className="overlay">
            <Tooltip title="Add to Watchlist" arrow>
              <button className="overlay-button" onClick={addToWatchlist}>
                <FontAwesomeIcon icon={faHeart} />
              </button>
            </Tooltip>
            <Tooltip title="Quick view" arrow>
              <Link to={`/details/${productId}`}>
                <button className="overlay-button">
                  <IoEye size={18} color="#fff" />
                </button>
              </Link>
            </Tooltip>
          </div>
        </div>
      </Link>

      <div className="info">
        <h4 className="title">
          <Link to={`/details/${productId}`}>
            {productName.length > 20
              ? productName.slice(0, 20) + "..."
              : productName}
          </Link>
        </h4>
        <p className="description">
          {productDescription.length > 42
            ? productDescription.slice(0, 82) + "..."
            : productDescription}
        </p>
        <Rating
          name="half-rating-read"
          value={parseFloat(item.rating) || 0}
          precision={0.5}
          readOnly
        />
        <span className="brand text-g">
          By <span className="text-g">{item.brand}</span>
        </span>
        <div className="d-flex align-items-center mt-3">
          <div className="d-flex align-items-center">
            <span className="price text-g font-weight-bold">₹{item.price}</span>
            {item.oldPrice && (
              <span className="oldPrice">₹{item.oldPrice}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
