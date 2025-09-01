import React, { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/styles.min.css";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import Slider from "react-slick";
import { ShoppingCart } from "lucide-react";
import Quantitybox from "../../components/quntitybox";
import Products from "../../components/Product";
import { fetchDataFromApi } from "../../utils/api";
import ReviewForm from "./ReviewForm";
import { MyContext } from "../../App";
import "./style.css";
import { useContext } from "react";

const Index = () => {
  const context = useContext(MyContext);
  const { id } = useParams();
  const [currentProduct, setCurrentProduct] = useState(null);
  const [zoomImage, setZoomImage] = useState("");
  const [activeSize, setActiveSize] = useState(null);
  const [activetab, setactivetabs] = useState(0);
  const [ProductQuantity, setProductQuantity] = useState(1); // Initialize with 1
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [TabError, setTabError] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  let [cartFields, setCartFields] = useState({});

  const fetchReviews = async () => {
    if (!id) return;

    setReviewsLoading(true);
    try {
      const reviewsData = await fetchDataFromApi(
        `/api/productReviews?productId=${id}`
      );
      setReviews(reviewsData || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Update your useEffect to also fetch reviews
  useEffect(() => {
    // Reset states when product ID changes
    setCurrentProduct(null);
    setZoomImage("");
    setActiveSize(null);
    setProductQuantity(1);
    setTabError(false);
    setReviews([]); // Reset reviews

    fetchDataFromApi(`/api/products/${id}`).then((res) => {
      console.log("Product data received:", res);
      setCurrentProduct(res);
      if (res?.images?.length > 0) setZoomImage(res.images[0]);

      // Fetch related products
      if (res?.category?._id) {
        fetchDataFromApi(
          `/api/products?catId=${res.category._id}&limit=8`
        ).then((relatedRes) => {
          setRelatedProducts(relatedRes?.products || []);
        });
      }
    });

    // Fetch reviews
    fetchReviews();
  }, [id]);

  // Add this callback function for when a new review is submitted
  const handleReviewSubmitted = () => {
    fetchReviews(); // Refresh the reviews list
  };

  useEffect(() => {
    // Reset states when product ID changes
    setCurrentProduct(null);
    setZoomImage("");
    setActiveSize(null);
    setProductQuantity(1);
    setTabError(false);

    fetchDataFromApi(`/api/products/${id}`).then((res) => {
      console.log("Product data received:", res); // Debug log
      setCurrentProduct(res);
      if (res?.images?.length > 0) setZoomImage(res.images[0]);

      // Fetch related products
      if (res?.category?._id) {
        fetchDataFromApi(
          `/api/products?catId=${res.category._id}&limit=8`
        ).then((relatedRes) => {
          setRelatedProducts(relatedRes?.products || []);
        });
      }
    });
  }, [id]);

  if (!currentProduct) return <p>Loading...</p>;

  // Settings for related products slider
  const relatedSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // Thumbnail click handler
  const handleThumbnailClick = (img, index) => {
    setZoomImage(img);
  };

  // Check if product has weights or sizes
  const hasWeightsOrSizes = () => {
    return (
      (Array.isArray(currentProduct.productWeight) &&
        currentProduct.productWeight.length > 0) ||
      (Array.isArray(currentProduct.sizes) && currentProduct.sizes.length > 0)
    );
  };

  // Check if product is in stock
  const isInStock = () => {
    return currentProduct.countInStock > 0;
  };

  // Inline styles for components
  const styles = {
    cartBtn: {
      width: "140px",
      height: "45px",
      fontSize: "14px",
      padding: "0 16px",
      borderRadius: "25px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#28a745",
      color: "white",
      border: "none",
      fontWeight: "600",
      textTransform: "none",
      transition: "all 0.3s ease",
      "&:hover": {
        backgroundColor: "#218838",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
      },
    },
    fontSvg: {
      fontSize: "20px",
      marginRight: "8px",
    },
    wishlistBtn: {
      width: "45px",
      height: "45px",
      borderRadius: "50%",
      backgroundColor: "#f8f9fa",
      border: "2px solid #e9ecef",
      color: "#6c757d",
      minWidth: "45px",
      marginLeft: "10px",
      transition: "all 0.3s ease",
      "&:hover": {
        backgroundColor: "#ff6b6b",
        color: "white",
        borderColor: "#ff6b6b",
      },
    },
    compareBtn: {
      width: "45px",
      height: "45px",
      borderRadius: "50%",
      backgroundColor: "#f8f9fa",
      border: "2px solid #e9ecef",
      color: "#6c757d",
      minWidth: "45px",
      marginLeft: "8px",
      transition: "all 0.3s ease",
      "&:hover": {
        backgroundColor: "#17a2b8",
        color: "white",
        borderColor: "#17a2b8",
      },
    },
    sizeTag: {
      padding: "8px 16px",
      border: "2px solid #e9ecef",
      borderRadius: "20px",
      backgroundColor: "white",
      color: "#495057",
      cursor: "pointer",
      textDecoration: "none",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.3s ease",
      display: "inline-block",
      margin: "4px",
    },
    activeSizeTag: {
      backgroundColor: "#28a745",
      color: "white",
      borderColor: "#28a745",
    },
    errorSizeTag: {
      backgroundColor: "#fff",
      color: "#dc3545",
      borderColor: "#dc3545",
      animation: "shake 0.5s ease-in-out",
    },
    tabBtn: {
      backgroundColor: "transparent",
      border: "none",
      padding: "12px 24px",
      color: "#6c757d",
      fontSize: "16px",
      fontWeight: "500",
      borderBottom: "3px solid transparent",
      transition: "all 0.3s ease",
      textTransform: "none",
    },
    activeTabBtn: {
      color: "#28a745",
      borderBottomColor: "#28a745",
    },
    errorTabBtn: {
      color: "#dc3545",
      borderBottomColor: "#dc3545",
      animation: "pulse 1s infinite",
    },
    priceSection: {
      padding: "20px 0",
      borderTop: "1px solid #e9ecef",
      borderBottom: "1px solid #e9ecef",
      margin: "20px 0",
    },
    currentPrice: {
      fontSize: "32px",
      fontWeight: "700",
      color: "#28a745",
    },
    oldPrice: {
      fontSize: "18px",
      color: "#6c757d",
      textDecoration: "line-through",
    },
    discount: {
      backgroundColor: "#ff6b6b",
      color: "white",
      padding: "4px 12px",
      borderRadius: "15px",
      fontSize: "14px",
      fontWeight: "600",
    },
    stockStatus: {
      fontSize: "16px",
      fontWeight: "600",
      padding: "8px 16px",
      borderRadius: "20px",
      display: "inline-block",
      marginTop: "10px",
    },
    inStock: {
      backgroundColor: "#d4edda",
      color: "#155724",
      border: "1px solid #c3e6cb",
    },
    outOfStock: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      border: "1px solid #f5c6cb",
    },
    errorMessage: {
      backgroundColor: "#f8d7da",
      color: "#721c24",
      padding: "12px 16px",
      borderRadius: "8px",
      border: "1px solid #f5c6cb",
      fontSize: "14px",
      fontWeight: "500",
      marginBottom: "15px",
      display: "flex",
      alignItems: "center",
    },
  };

  const quantity = (val) => {
    console.log("Quantity updated to:", val); // Debug log
    setProductQuantity(val);
  };

  const selectedItem = () => {};

  const addToCart = async () => {
    console.log("Add to cart clicked"); // Debug log
    console.log("Current product:", currentProduct); // Debug log
    console.log("Product quantity:", ProductQuantity); // Debug log

    // Check if product is out of stock
    if (!isInStock()) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "This product is currently out of stock!",
      });
      return;
    }

    // Check if product has weights/sizes and none is selected
    if (hasWeightsOrSizes() && activeSize === null) {
      setTabError(true);
      // Clear error after 3 seconds
      setTimeout(() => {
        setTabError(false);
      }, 3000);
      return;
    }

    // Clear any existing error
    setTabError(false);

    // Get user data
    const user = JSON.parse(localStorage.getItem("user"));

    // Check if user is logged in
    if (!user || !user.userId) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please login first to add items to cart!",
      });
      return;
    }

    // Check if quantity is set and valid
    if (!ProductQuantity || ProductQuantity <= 0) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please select a valid quantity!",
      });
      return;
    }

    // Get the correct product ID (try multiple possible fields)
    const productId = currentProduct._id || currentProduct.id;

    if (!productId) {
      console.error("No product ID found:", currentProduct);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Product ID not found. Please refresh and try again.",
      });
      return;
    }

    // Get selected size/weight if applicable
    let selectedSize = null;
    if (hasWeightsOrSizes() && activeSize !== null) {
      if (
        Array.isArray(currentProduct.productWeight) &&
        currentProduct.productWeight.length > 0
      ) {
        selectedSize = currentProduct.productWeight[activeSize];
      } else if (
        Array.isArray(currentProduct.sizes) &&
        currentProduct.sizes.length > 0
      ) {
        selectedSize = currentProduct.sizes[activeSize];
      }
    }

    // Prepare cart data with all required fields
    const cartData = {
      productTitle: currentProduct.name || currentProduct.title,
      image:
        currentProduct.images?.[0] ||
        currentProduct.image ||
        currentProduct.catImg,
      rating: currentProduct.rating || 0,
      price: parseFloat(currentProduct.price) || 0,
      quantity: parseInt(ProductQuantity),
      subTotal: parseFloat(currentProduct.price) * parseInt(ProductQuantity),
      productId: productId,
      countInStock: currentProduct.countInStock || 999,
      userId: user.userId,
      selectedSize: selectedSize, // Add selected size/weight
    };

    console.log("Cart data being sent:", cartData); // Debug log

    try {
      // Show loading state
      context.setIsLoading(true);

      // Call the context addToCart function
      await context.addToCart(cartData);

      // Refresh cart data after successful addition
      if (context.getCartData) {
        await context.getCartData();
      }
    } catch (error) {
      console.error("Error in addToCart:", error);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Failed to add item to cart. Please try again.",
      });
    } finally {
      context.setIsLoading(false);
    }
  };

  return (
    <section className="detailpage mb-5">
      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>

      <div className="breadcrumbWrapper">
        <div className="container-fluid">
          <nav aria-label="breadcrumb">
            <ul className="breadcrumb breadcrumb2 mb-0">
              <li className="breadcrumb-item">
                <Link className="breadcrumb-link" to="/">
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link
                  className="breadcrumb-link"
                  to={
                    currentProduct.category?.slug
                      ? `/category/${currentProduct.category.slug}`
                      : "#"
                  }
                >
                  {currentProduct.category?.name || ""}
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                <span className="breadcrumb-link">{currentProduct.name}</span>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="container-fluid detailscontainer">
        <div className="row align-items-start">
          <div className="col-md-4">
            <div className="productzoom">
              <InnerImageZoom
                zoomType="hover"
                zoomScale={1}
                src={zoomImage}
                alt={currentProduct.name}
              />
            </div>
            {/* Thumbnails Row */}
            {currentProduct.images?.length > 1 && (
              <div className="image-thumbnails-row mt-3 d-flex flex-row gap-2">
                {currentProduct.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`thumb-${index}`}
                    className={`thumb-img ${
                      zoomImage === img ? "active-thumb" : ""
                    }`}
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      border:
                        zoomImage === img
                          ? "3px solid #28a745"
                          : "2px solid #e9ecef",
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => handleThumbnailClick(img, index)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="col-md-7 productInfo">
            <h3
              style={{
                fontSize: "28px",
                fontWeight: "700",
                color: "#2c3e50",
                marginBottom: "16px",
              }}
            >
              {currentProduct.name}
            </h3>
            <div className="d-flex align-items-center mb-3 mt-3">
              <Rating
                name="half-rating-read"
                value={
                  reviews.length > 0
                    ? reviews.reduce(
                        (sum, review) => sum + (review.customerRating || 0),
                        0
                      ) / reviews.length
                    : parseFloat(currentProduct.rating) || 0
                }
                precision={0.5}
                readOnly
                size="large"
              />
              <span className="text-muted ms-2" style={{ fontSize: "16px" }}>
                ({reviews.length} reviews)
              </span>
            </div>
            <div
              className="priceSec d-flex align-items-center"
              style={styles.priceSection}
            >
              <span style={styles.currentPrice}>₹{currentProduct.price}</span>
              {currentProduct.discount && (
                <div className="ms-3 d-flex flex-column align-items-start">
                  <span style={styles.discount}>
                    {currentProduct.discount}% OFF
                  </span>
                  <span style={styles.oldPrice}>
                    ₹{currentProduct.oldPrice}
                  </span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="stock-status mb-3">
              <span
                style={{
                  ...styles.stockStatus,
                  ...(isInStock() ? styles.inStock : styles.outOfStock),
                }}
              >
                {isInStock() ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <p
              style={{
                fontSize: "16px",
                lineHeight: "1.6",
                color: "#6c757d",
                margin: "20px 0",
              }}
            >
              {currentProduct.description}
            </p>

            {/* Error Message */}
            {TabError && (
              <div style={styles.errorMessage}>
                <span style={{ marginRight: "8px" }}>⚠️</span>
                Please select a size/weight before adding to cart.
              </div>
            )}

            {/* Sizes/Weights */}
            <div className="prodctSize d-flex align-items-center mb-4">
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  marginRight: "16px",
                }}
              >
                Size/Weight:
              </span>
              <div className="d-flex flex-wrap">
                {Array.isArray(currentProduct.productWeight) &&
                currentProduct.productWeight.length > 0 ? (
                  currentProduct.productWeight.map((w, i) => (
                    <a
                      key={i}
                      style={{
                        ...styles.sizeTag,
                        ...(activeSize === i ? styles.activeSizeTag : {}),
                        ...(TabError && activeSize === null
                          ? styles.errorSizeTag
                          : {}),
                      }}
                      onClick={() => {
                        setActiveSize(i);
                        setTabError(false); // Clear error when size is selected
                      }}
                    >
                      {w}
                    </a>
                  ))
                ) : Array.isArray(currentProduct.sizes) &&
                  currentProduct.sizes.length > 0 ? (
                  currentProduct.sizes.map((size, i) => (
                    <a
                      key={i}
                      style={{
                        ...styles.sizeTag,
                        ...(activeSize === i ? styles.activeSizeTag : {}),
                        ...(TabError && activeSize === null
                          ? styles.errorSizeTag
                          : {}),
                      }}
                      onClick={() => {
                        setActiveSize(i);
                        setTabError(false); // Clear error when size is selected
                      }}
                    >
                      {size}
                    </a>
                  ))
                ) : (
                  <span
                    style={{
                      ...styles.sizeTag,
                      cursor: "not-allowed",
                      opacity: 0.6,
                    }}
                  >
                    Not available
                  </span>
                )}
              </div>
            </div>

            <div className="addcartSection mt-4 pt-4 d-flex align-items-center">
              <Quantitybox
                quantity={quantity}
                item={currentProduct}
                selectedItem={selectedItem}
                value={ProductQuantity} // Use the state value
              />

              <Button
                style={{
                  ...styles.cartBtn,
                  backgroundColor: !isInStock() ? "#6c757d" : "#28a745",
                  cursor: !isInStock() ? "not-allowed" : "pointer",
                }}
                className="cart-btn ms-3"
                onClick={addToCart}
                disabled={
                  context.isLoading || context.isAddingInCart || !isInStock()
                }
                onMouseEnter={(e) => {
                  if (
                    !context.isLoading &&
                    !context.isAddingInCart &&
                    isInStock()
                  ) {
                    e.target.style.backgroundColor = "#218838";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(40, 167, 69, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (
                    !context.isLoading &&
                    !context.isAddingInCart &&
                    isInStock()
                  ) {
                    e.target.style.backgroundColor = "#28a745";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }
                }}
              >
                <ShoppingCart style={styles.fontSvg} />
                {!isInStock()
                  ? "Out of Stock"
                  : context.isLoading || context.isAddingInCart
                  ? "Adding..."
                  : "Add to Cart"}
              </Button>
              <Button
                style={styles.wishlistBtn}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#ff6b6b";
                  e.target.style.color = "white";
                  e.target.style.borderColor = "#ff6b6b";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#f8f9fa";
                  e.target.style.color = "#6c757d";
                  e.target.style.borderColor = "#e9ecef";
                }}
              >
                <FavoriteBorderIcon />
              </Button>
              <Button
                style={styles.compareBtn}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#17a2b8";
                  e.target.style.color = "white";
                  e.target.style.borderColor = "#17a2b8";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#f8f9fa";
                  e.target.style.color = "#6c757d";
                  e.target.style.borderColor = "#e9ecef";
                }}
              >
                <CompareArrowsIcon />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div
          className="card mt-5 p-5 detailsPageTabs"
          style={{ border: "1px solid #e9ecef", borderRadius: "15px" }}
        >
          <div className="customTabs">
            <ul
              className="list list-inline border-bottom"
              style={{ paddingBottom: "0" }}
            >
              {[
                "Description",
                "Additional Info",
                "Product Data",
                "Reviews",
              ].map((tab, i) => (
                <li className="list-inline-item" key={i}>
                  <Button
                    style={{
                      ...styles.tabBtn,
                      ...(activetab === i ? styles.activeTabBtn : {}),
                      ...(TabError && i === 0 ? styles.errorTabBtn : {}), // Show error on first tab
                    }}
                    onClick={() => setactivetabs(i)}
                  >
                    {tab}
                  </Button>
                </li>
              ))}
            </ul>
            <br />
            <div style={{ minHeight: "200px", padding: "20px 0" }}>
              {activetab === 0 && (
                <div
                  className="tabContent"
                  style={{
                    fontSize: "16px",
                    lineHeight: "1.8",
                    color: "#495057",
                  }}
                >
                  {currentProduct.longDescription || currentProduct.description}
                </div>
              )}
              {activetab === 1 && (
                <div
                  className="tabContent"
                  style={{
                    fontSize: "16px",
                    lineHeight: "1.8",
                    color: "#495057",
                  }}
                >
                  {currentProduct.additionalInfo ||
                    "Additional information not available."}
                </div>
              )}
              {activetab === 2 && (
                <div className="tabContent">
                  <table className="table table-striped">
                    <tbody>
                      <tr>
                        <td>
                          <strong>Brand</strong>
                        </td>
                        <td>{currentProduct.brand || "N/A"}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>SKU</strong>
                        </td>
                        <td>{currentProduct.sku || "N/A"}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Weight</strong>
                        </td>
                        <td>{currentProduct.weight || "N/A"}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Dimensions</strong>
                        </td>
                        <td>{currentProduct.dimensions || "N/A"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {activetab === 3 && (
                <div className="tabContent">
                  {reviewsLoading ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                      <p>Loading reviews...</p>
                    </div>
                  ) : (
                    <>
                      {/* Existing Reviews */}
                      {reviews && reviews.length > 0 ? (
                        <div className="existing-reviews mb-4">
                          <h5 style={{ marginBottom: "20px", fontWeight: 600 }}>
                            Customer Reviews ({reviews.length})
                          </h5>
                          {reviews.map((review, index) => (
                            <div
                              key={review._id || index}
                              className="review-item mb-4 p-3"
                              style={{
                                border: "1px solid #e9ecef",
                                borderRadius: "8px",
                                backgroundColor: "#fff",
                              }}
                            >
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="d-flex align-items-center">
                                  <Rating
                                    value={review.customerRating || 0}
                                    readOnly
                                    size="small"
                                  />
                                  <span
                                    className="ms-2 fw-bold"
                                    style={{ color: "#2c3e50" }}
                                  >
                                    {review.customerName}
                                  </span>
                                </div>
                                <span
                                  style={{ fontSize: "12px", color: "#6c757d" }}
                                >
                                  {review.dateCreated
                                    ? new Date(
                                        review.dateCreated
                                      ).toLocaleDateString()
                                    : "Recently"}
                                </span>
                              </div>
                              <p
                                style={{
                                  margin: 0,
                                  lineHeight: "1.6",
                                  color: "#495057",
                                }}
                              >
                                {review.review}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          className="no-reviews mb-4"
                          style={{ textAlign: "center", padding: "40px" }}
                        >
                          <p style={{ fontSize: "16px", color: "#6c757d" }}>
                            No reviews yet. Be the first to review this product!
                          </p>
                        </div>
                      )}

                      {/* Review Form */}
                      <ReviewForm
                        productId={id}
                        onReviewSubmitted={handleReviewSubmitted}
                        context={context}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products mt-5">
            <h4
              style={{
                fontSize: "24px",
                fontWeight: "700",
                marginBottom: "30px",
                color: "#2c3e50",
              }}
            >
              Related Products
            </h4>
            <Slider {...relatedSettings}>
              {relatedProducts.map((product, index) => (
                <div key={product._id || index} className="px-2">
                  <Products item={product} />
                </div>
              ))}
            </Slider>
          </div>
        )}
      </div>
    </section>
  );
};

export default Index;
