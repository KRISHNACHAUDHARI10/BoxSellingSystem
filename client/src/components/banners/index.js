import React, { useState, useEffect } from "react";
import "./style.css";

const Banners = ({ categoryId = null, maxBanners = 3 }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the base URL for API requests
  const getApiBaseUrl = () => {
    return (
      process.env.REACT_APP_API_URL ||
      process.env.REACT_APP_BASE_URL ||
      "http://localhost:4000"
    );
  };

  // Helper function to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // If it's already a full URL, return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    const baseUrl = getApiBaseUrl();

    // Handle different path formats
    if (imagePath.startsWith("/uploads/")) {
      return `${baseUrl}${imagePath}`;
    } else if (imagePath.startsWith("uploads/")) {
      return `${baseUrl}/${imagePath}`;
    } else if (imagePath.startsWith("/")) {
      return `${baseUrl}${imagePath}`;
    } else {
      return `${baseUrl}/${imagePath}`;
    }
  };

  // Fetch banners from API
  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = getApiBaseUrl();
      let apiUrl = `${baseUrl}/api/banners`;

      // If categoryId is provided, filter by category
      if (categoryId) {
        apiUrl += `?categoryId=${categoryId}`;
      }

      console.log("Fetching banners from:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
          ...(localStorage.getItem("token") && {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Banners API response:", data);

      let bannersData = [];

      // Handle different response formats
      if (data) {
        if (data.success === true && Array.isArray(data.data)) {
          bannersData = data.data;
        } else if (Array.isArray(data.data)) {
          bannersData = data.data;
        } else if (Array.isArray(data)) {
          bannersData = data;
        } else if (Array.isArray(data.banners)) {
          bannersData = data.banners;
        }
      }

      // Filter banners that have images
      const validBanners = bannersData.filter(
        (banner) => banner.images && banner.images.length > 0
      );

      // Limit the number of banners if maxBanners is specified
      const limitedBanners = maxBanners
        ? validBanners.slice(0, maxBanners)
        : validBanners;

      setBanners(limitedBanners);
      console.log(`Successfully loaded ${limitedBanners.length} banners`);
    } catch (error) {
      console.error("Error fetching banners:", error);
      setError(error.message || "Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  // Fetch banners on component mount
  useEffect(() => {
    fetchBanners();
  }, [categoryId, maxBanners]);

  // Loading state
  if (loading) {
    return (
      <div className="bannerSection">
        <div className="container-fluid">
          <div className="row g-3">
            {[...Array(maxBanners)].map((_, index) => (
              <div key={index} className="col-md-4">
                <div className="box">
                  <div
                    className="banner-placeholder"
                    style={{
                      width: "100%",
                      height: "200px",
                      backgroundColor: "#f8f9fa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                      border: "1px solid #dee2e6",
                    }}
                  >
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bannerSection">
        <div className="container-fluid">
          <div className="row g-3">
            <div className="col-12">
              <div className="alert alert-warning text-center" role="alert">
                <h6 className="mb-2">Unable to load banners</h6>
                <p className="mb-2">{error}</p>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={fetchBanners}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No banners available
  if (banners.length === 0) {
    return (
      <div className="bannerSection">
        <div className="container-fluid">
          <div className="row g-3">
            <div className="col-12">
              <div className="alert alert-info text-center" role="alert">
                <h6 className="mb-0">No banners available at the moment</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate column class based on number of banners
  const getColumnClass = (totalBanners) => {
    if (totalBanners === 1) return "col-md-12";
    if (totalBanners === 2) return "col-md-6";
    if (totalBanners >= 3) return "col-md-4";
    return "col-md-4";
  };

  const columnClass = getColumnClass(banners.length);

  return (
    <div className="bannerSection">
      <div className="container-fluid">
        <div className="row g-3">
          {banners.map((banner, index) => {
            // Use the first image from the banner
            const imageUrl =
              banner.images && banner.images[0]
                ? getFullImageUrl(banner.images[0])
                : null;

            return (
              <div
                key={banner._id || banner.id || index}
                className={columnClass}
              >
                <div className="box">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      className="banner-img w-100 transition"
                      alt={`${banner.catName || "Banner"} ${index + 1}`}
                      style={{
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                      onError={(e) => {
                        console.error("Image load error:", imageUrl);
                        // Replace with placeholder on error
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                      onLoad={() => {
                        console.log("Image loaded successfully:", imageUrl);
                      }}
                    />
                  ) : (
                    <div
                      className="banner-placeholder"
                      style={{
                        width: "100%",
                        height: "200px",
                        backgroundColor: "#f8f9fa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",
                        border: "1px solid #dee2e6",
                        color: "#6c757d",
                      }}
                    >
                      <span>No Image Available</span>
                    </div>
                  )}

                  {/* Hidden placeholder for error fallback */}
                  <div
                    className="banner-placeholder"
                    style={{
                      width: "100%",
                      height: "200px",
                      backgroundColor: "#f8f9fa",
                      display: "none",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                      border: "1px solid #dee2e6",
                      color: "#6c757d",
                    }}
                  >
                    <span>Image Load Failed</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Debug info (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-3">
            <small className="text-muted">
              Debug: Showing {banners.length} banner(s)
              {categoryId && ` for category ${categoryId}`}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default Banners;
