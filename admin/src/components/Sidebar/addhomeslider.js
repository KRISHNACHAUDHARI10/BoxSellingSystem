import React, { useState, useContext } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import HomeIcon from "@mui/icons-material/Home";
import { Link, useNavigate } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { emphasize, styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { IoCloseSharp } from "react-icons/io5";
import { FaRegImages } from "react-icons/fa";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Mycontext } from "../../App";
import { deleteData, postData, uploadImage } from "../../utils/api";

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

const AddHomeSlider = () => {
  const context = useContext(Mycontext);
  const navigate = useNavigate();

  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // Handle file change - Improved with better error handling
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
        // Reset the input
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
      console.log("Starting upload to:", apiEndPoint);
      console.log(
        "FormData contains:",
        Array.from(formdata.entries()).map(([key, value]) => [
          key,
          value instanceof File ? value.name : value,
        ])
      );

      // Upload images and get their URLs back from the API
      const res = await uploadImage(apiEndPoint, formdata);

      console.log("Upload response:", res);

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
        config: error.config,
      });

      let errorMessage = "Image upload failed!";

      if (error.response) {
        // Server responded with error status
        errorMessage =
          error.response.data?.error ||
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Something else happened
        errorMessage = error.message || "Unknown error occurred";
      }

      context.setAlertBox({
        open: true,
        error: true,
        msg: errorMessage,
      });
    } finally {
      setUploading(false);
      // Reset the input so the same file can be selected again if needed
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

  // Submit form - Improved error handling
  const addHomeSlide = async (e) => {
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

      const response = await postData("/api/homeBanner/create", payload);

      if (response && response.success) {
        // Clean up all temporary images after successful creation
        try {
          await deleteData("/api/imageUpload/deleteAllImages");
        } catch (cleanupError) {
          console.warn("Cleanup warning:", cleanupError);
          // Don't show error to user for cleanup issues
        }

        context.setAlertBox({
          open: true,
          error: false,
          msg: "Home Banner Slider created successfully!",
        });
        navigate("/homeBannerSlide/list");
      } else {
        throw new Error(response?.message || "Failed to create banner");
      }
    } catch (err) {
      console.error("Create banner error:", err);
      context.setAlertBox({
        open: true,
        error: true,
        msg:
          err.response?.data?.message ||
          err.message ||
          "Something went wrong while saving!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="card shadow mybreadcrumb border-0 w-100 flex-row p-4 align-items-center justify-content-between">
        <h5 className="mb-0">Add Home Slider</h5>
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
            <StyledBreadcrumb label="Add" />
          </Breadcrumbs>
        </div>
      </div>

      <form className="form" onSubmit={addHomeSlide}>
        <div className="card p-4 mt-4">
          <h5 className="mb-4">Upload Slider Images</h5>
          <div className="imagesUploadSec">
            <div
              className="d-flex align-items-center"
              style={{ flexWrap: "wrap", gap: "15px" }}
            >
              {/* Display uploaded images */}
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
                      e.target.src = "/placeholder-image.jpg"; // Fallback image
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
                </div>
              ))}

              {/* Upload box */}
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
                      id="image-upload"
                      style={{ display: "none" }}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="image-upload"
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
                          Add Images
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

          <div className="mt-4">
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || uploading || previews.length === 0}
              fullWidth
              size="large"
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} style={{ marginRight: "10px" }} />
                  Saving...
                </>
              ) : (
                `Save Slider (${previews.length} image${
                  previews.length !== 1 ? "s" : ""
                })`
              )}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};

export default AddHomeSlider;
