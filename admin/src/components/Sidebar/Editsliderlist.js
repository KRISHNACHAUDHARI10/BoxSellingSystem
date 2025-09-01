import React, { useState, useContext, useEffect } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import HomeIcon from "@mui/icons-material/Home";
import { Link, useNavigate, useParams } from "react-router-dom";
import { emphasize, styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { IoCloseSharp } from "react-icons/io5";
import { FaRegImages } from "react-icons/fa";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Mycontext } from "../../App";
import {
  fetchDataFromApi,
  putData,
  deleteData,
  uploadImage,
} from "../../utils/api";

// Styled breadcrumb chip
const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.grey[800]
      : theme.palette.grey[100],
  height: theme.spacing(3),
  color: theme.palette.text.primary,
  fontWeight: theme.typography.fontWeightRegular,
  "&:hover, &:focus": {
    backgroundColor: emphasize(
      theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[100],
      0.06
    ),
  },
  "&:active": {
    boxShadow: theme.shadows[1],
    backgroundColor: emphasize(
      theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[100],
      0.12
    ),
  },
}));

const EditSliderList = () => {
  const context = useContext(Mycontext);
  const navigate = useNavigate();
  const { id } = useParams(); // Get banner ID from URL

  const [previews, setPreviews] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [bannerData, setBannerData] = useState(null);

  // Fetch existing banner data on component mount
  useEffect(() => {
    if (id) {
      fetchBannerData();
    } else {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Invalid banner ID",
      });
      navigate("/homeBannerSlide/list");
    }
  }, [id]);

  const fetchBannerData = async () => {
    try {
      setFetchLoading(true);
      const response = await fetchDataFromApi(`/api/homeBanner/${id}`);

      if (response && response.success && response.data) {
        setBannerData(response.data);
        const images = response.data.images || [];
        setPreviews([...images]);
        setOriginalImages([...images]);
      } else {
        throw new Error(response?.message || "Banner not found");
      }
    } catch (error) {
      console.error("Fetch banner error:", error);
      context.setAlertBox({
        open: true,
        error: true,
        msg:
          error.response?.data?.message ||
          error.message ||
          "Failed to load banner data",
      });
      navigate("/homeBannerSlide/list");
    } finally {
      setFetchLoading(false);
    }
  };

  // Validate file type and size
  const validateFile = (file) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return "Please select a valid JPG, JPEG, PNG, or WEBP file.";
    }

    if (file.size > maxSize) {
      return "File size must be less than 10MB.";
    }

    return null;
  };

  // Handle file change - Add new images
  const onChangeFile = async (e, apiEndPoint) => {
    e.preventDefault();
    const files = e.target.files;

    if (!files || files.length === 0) {
      return;
    }

    // Validate files before upload
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: error,
        });
        e.target.value = "";
        return;
      }
    }

    setUploading(true);
    const formdata = new FormData();

    // Append all files to FormData
    for (const file of files) {
      formdata.append("images", file);
    }

    try {
      // Upload images and get their URLs back from the API
      const res = await uploadImage(apiEndPoint, formdata);

      if (res && res.success && res.urls && res.urls.length > 0) {
        setPreviews((prev) => [...prev, ...res.urls]);
        context.setAlertBox({
          open: true,
          error: false,
          msg: `${res.urls.length} image(s) uploaded successfully!`,
        });
      } else if (res && res.images && res.images.length > 0) {
        // Handle backward compatibility with your existing API
        setPreviews((prev) => [...prev, ...res.images]);
        context.setAlertBox({
          open: true,
          error: false,
          msg: `${res.images.length} image(s) uploaded successfully!`,
        });
      } else {
        console.error("Unexpected response format:", res);
        throw new Error(
          res?.msg || res?.error || "Upload failed - no URLs returned"
        );
      }
    } catch (error) {
      console.error("Upload error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      let errorMessage = "Image upload failed!";

      if (error.response) {
        errorMessage =
          error.response.data?.error ||
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || "Unknown error occurred";
      }

      context.setAlertBox({
        open: true,
        error: true,
        msg: errorMessage,
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Remove Image - Improved error handling
  const removeImg = async (indexToRemove, imgUrl) => {
    const originalPreviews = [...previews];

    // Optimistically update the UI
    setPreviews(previews.filter((_, index) => index !== indexToRemove));

    try {
      const response = await deleteData(
        `/api/imageUpload/deleteImage?img=${encodeURIComponent(imgUrl)}`
      );

      if (response && response.success) {
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Image removed successfully!",
        });
      } else {
        throw new Error(response?.message || "Failed to delete image");
      }
    } catch (error) {
      console.error("Failed to delete image from server:", error);

      // Restore the image to the UI since deletion failed
      setPreviews(originalPreviews);

      context.setAlertBox({
        open: true,
        error: true,
        msg:
          error.response?.data?.message ||
          error.message ||
          "Failed to remove image from server!",
      });
    }
  };

  // Submit form - Update the banner
  const updateBanner = async (e) => {
    e.preventDefault();

    if (previews.length === 0) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please upload at least one image!",
      });
      return;
    }

    const payload = { images: previews };

    try {
      setIsLoading(true);

      const response = await putData(`/api/homeBanner/${id}`, payload);

      if (response && response.success) {
        // Clean up temporary images after successful update
        try {
          await deleteData("/api/imageUpload/deleteAllImages");
        } catch (cleanupError) {
          console.warn("Cleanup warning:", cleanupError);
        }

        context.setAlertBox({
          open: true,
          error: false,
          msg: "Home Banner Slider updated successfully!",
        });
        navigate("/homeBannerSlide/list");
      } else {
        throw new Error(response?.message || "Failed to update banner");
      }
    } catch (err) {
      console.error("Update banner error:", err);
      context.setAlertBox({
        open: true,
        error: true,
        msg:
          err.response?.data?.message ||
          err.message ||
          "Something went wrong while updating!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if there are any changes
  const hasChanges = () => {
    if (previews.length !== originalImages.length) return true;
    return !previews.every((img, index) => img === originalImages[index]);
  };

  if (fetchLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center">
          <CircularProgress />
          <p className="mt-3">Loading banner data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card shadow mybreadcrumb border-0 w-100 flex-row p-4 align-items-center justify-content-between">
        <h5 className="mb-0">Edit Home Slider</h5>
        <div role="presentation">
          <Breadcrumbs aria-label="breadcrumb">
            <StyledBreadcrumb
              component={Link}
              to="/"
              label="Dashboard"
              icon={<HomeIcon fontSize="small" />}
            />
            <StyledBreadcrumb
              label="Home Banners"
              component={Link}
              to="/homeBannerSlide/list"
            />
            <StyledBreadcrumb label="Edit" />
          </Breadcrumbs>
        </div>
      </div>

      <form className="form" onSubmit={updateBanner}>
        <div className="card p-4 mt-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0">Edit Slider Images</h5>
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted">
                Created:{" "}
                {bannerData?.createdAt
                  ? new Date(bannerData.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
              {hasChanges() && (
                <Chip label="Unsaved Changes" color="warning" size="small" />
              )}
            </div>
          </div>

          <div className="imagesUploadSec">
            <div
              className="d-flex align-items-center"
              style={{ flexWrap: "wrap", gap: "15px" }}
            >
              {/* Display current images */}
              {previews.map((img, index) => (
                <div
                  className="uploadBox"
                  key={index}
                  style={{ position: "relative" }}
                >
                  <LazyLoadImage
                    src={img}
                    alt={`preview ${index}`}
                    effect="blur"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                    onError={(e) => {
                      console.error(`Failed to load image: ${img}`);
                      e.target.src = "/placeholder-image.jpg";
                    }}
                  />
                  <Button
                    onClick={() => removeImg(index, img)}
                    disabled={uploading || isLoading}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      minWidth: "auto",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      padding: "0",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      color: "#000",
                    }}
                  >
                    <IoCloseSharp />
                  </Button>
                  {/* Show indicator if this is an original image */}
                  {originalImages.includes(img) && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "5px",
                        left: "5px",
                        backgroundColor: "rgba(76, 175, 80, 0.8)",
                        color: "white",
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "3px",
                      }}
                    >
                      Original
                    </div>
                  )}
                </div>
              ))}

              {/* Upload box for adding new images */}
              <div className="uploadBox">
                {uploading ? (
                  <div className="progressBar text-center d-flex align-items-center justify-content-center flex-column">
                    <CircularProgress />
                    <span className="mt-2">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={(e) =>
                        onChangeFile(e, "/api/imageUpload/upload")
                      }
                      name="images"
                      id="image-upload-edit"
                      style={{ display: "none" }}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="image-upload-edit"
                      style={{
                        cursor: isLoading ? "not-allowed" : "pointer",
                        width: "100%",
                        height: "100%",
                        opacity: isLoading ? 0.5 : 1,
                      }}
                    >
                      <div className="info d-flex align-items-center justify-content-center flex-column h-100">
                        <FaRegImages
                          style={{ fontSize: "3rem", color: "#ccc" }}
                        />
                        <h6 className="mt-2" style={{ color: "#666" }}>
                          Add More Images
                        </h6>
                        <small style={{ color: "#999", textAlign: "center" }}>
                          JPG, PNG, WEBP (Max 10MB each)
                        </small>
                      </div>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 d-flex gap-3">
            <Button
              type="submit"
              variant="contained"
              disabled={
                isLoading || uploading || previews.length === 0 || !hasChanges()
              }
              size="large"
              style={{ flex: 1 }}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} style={{ marginRight: "10px" }} />
                  Updating...
                </>
              ) : (
                `Update Slider (${previews.length} image${
                  previews.length !== 1 ? "s" : ""
                })`
              )}
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate("/homeBannerSlide/list")}
              disabled={isLoading || uploading}
              size="large"
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};

export default EditSliderList;
