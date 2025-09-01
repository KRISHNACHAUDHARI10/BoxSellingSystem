import React, { useState, useContext, useEffect } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import HomeIcon from "@mui/icons-material/Home";
import { Link, useNavigate } from "react-router-dom";
import { emphasize, styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import { IoCloseSharp } from "react-icons/io5";
import { FaRegImages } from "react-icons/fa";

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import "./banner.css";
import { Mycontext } from "../../App";
import {
  deleteData,
  postData,
  uploadImage,
  fetchDataFromApi,
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

const AddBanner = () => {
  const context = useContext(Mycontext);
  const navigate = useNavigate();

  // State management
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Helper function to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "";

    // If it's already a full URL, return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    // If it starts with /uploads or similar, construct full URL
    if (imagePath.startsWith("/")) {
      // Replace with your actual API base URL
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:4000";
      return `${baseUrl}${imagePath}`;
    }

    // If it's a relative path, construct full URL
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:4000";
    return `${baseUrl}/uploads/banners/${imagePath}`;
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

  // Load categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      console.log("Component mounted, checking categories...");
      console.log("Current catData:", context.catData);

      if (!context.catData || context.catData.length === 0) {
        setCategoriesLoading(true);
        try {
          console.log("Fetching categories...");
          await context.fetchCategory();
        } catch (error) {
          console.error("Error fetching categories:", error);
          context.setAlertBox({
            open: true,
            error: true,
            msg: "Failed to load categories. Please refresh the page.",
          });
        } finally {
          setCategoriesLoading(false);
        }
      } else {
        console.log("Categories already loaded:", context.catData.length);
      }
    };

    loadCategories();
  }, []);

  // Debug logging for context data
  useEffect(() => {
    console.log("Category data updated:", context.catData);
  }, [context.catData]);

  // Debug logging for previews
  useEffect(() => {
    console.log("Previews updated:", previews);
  }, [previews]);

  // Handle file upload with better error handling
  const onChangeFile = async (e) => {
    e.preventDefault();
    const files = e.target.files;

    if (!files || files.length === 0) {
      return;
    }

    console.log("Files selected:", files.length);

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
      console.log("Starting upload to: /api/banners/upload");

      // Upload images and get their URLs back from the API
      const res = await uploadImage("/api/banners/upload", formdata);

      console.log("Raw upload response:", res);

      // Handle different response formats
      if (res) {
        let imageUrls = [];

        // Check if response is an array
        if (Array.isArray(res)) {
          imageUrls = res;
        }
        // Check if response has images property
        else if (res.images && Array.isArray(res.images)) {
          imageUrls = res.images;
        }
        // Check if response has data property
        else if (res.data && Array.isArray(res.data)) {
          imageUrls = res.data;
        }
        // Single image response
        else if (typeof res === "string") {
          imageUrls = [res];
        }
        // Response with success flag
        else if (res.success && res.data) {
          imageUrls = Array.isArray(res.data) ? res.data : [res.data];
        }
        // Check if response has url/urls property
        else if (res.url) {
          imageUrls = [res.url];
        } else if (res.urls && Array.isArray(res.urls)) {
          imageUrls = res.urls;
        }

        console.log("Extracted image URLs:", imageUrls);

        if (imageUrls.length > 0) {
          // Convert relative paths to full URLs
          const fullImageUrls = imageUrls.map((url) => getFullImageUrl(url));
          console.log("Full image URLs:", fullImageUrls);

          setPreviews((prev) => {
            const newPreviews = [...prev, ...fullImageUrls];
            console.log("Setting new previews array:", newPreviews);
            return newPreviews;
          });

          context.setAlertBox({
            open: true,
            error: false,
            msg: `${imageUrls.length} image(s) uploaded successfully!`,
          });
        } else {
          console.error("No image URLs found in response:", res);
          throw new Error("Upload failed - no URLs returned from server");
        }
      } else {
        throw new Error("Upload failed - no response from server");
      }
    } catch (error) {
      console.error("Upload error details:", error);

      let errorMessage = "Image upload failed!";

      if (error.response) {
        console.error("Error response:", error.response);
        errorMessage =
          error.response.data?.error ||
          error.response.data?.message ||
          error.response.data?.msg ||
          `Server error: ${error.response.status} - ${error.response.statusText}`;
      } else if (error.request) {
        console.error("Error request:", error.request);
        errorMessage =
          "No response from server. Please check your connection and server status.";
      } else {
        errorMessage = error.message || "Unknown error occurred during upload";
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

  // Remove Image with better error handling
  const removeImg = async (indexToRemove, imgUrl) => {
    const originalPreviews = [...previews];

    // Optimistically update the UI
    setPreviews(previews.filter((_, index) => index !== indexToRemove));

    try {
      console.log("Attempting to delete image:", imgUrl);

      const response = await deleteData(
        `/api/imageUpload/deleteImage?img=${encodeURIComponent(imgUrl)}`
      );

      console.log("Delete response:", response);

      if (response && response.success !== false) {
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Image removed successfully!",
        });
      } else {
        throw new Error("Failed to delete image from server");
      }
    } catch (error) {
      console.error("Failed to delete image from server:", error);

      // Restore the image to the UI since deletion failed
      setPreviews(originalPreviews);

      let errorMessage = "Failed to remove image from server!";

      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          errorMessage;
      }

      context.setAlertBox({
        open: true,
        error: true,
        msg: errorMessage,
      });
    }
  };

  // Handle category selection
  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    console.log("Category selected:", categoryId);

    setSelectedCategory(categoryId);
    setSelectedSubCategory("");
    setSubCategories([]);

    if (categoryId) {
      setLoadingSubCategories(true);
      try {
        console.log("Fetching subcategories for category:", categoryId);

        let response;
        try {
          response = await fetchDataFromApi(
            `/api/subCategory?categoryId=${categoryId}`
          );
          console.log("Subcategories from /api/subCategory:", response);
        } catch (error) {
          console.log(
            "Subcategory endpoint failed, trying category endpoint..."
          );
          response = await fetchDataFromApi(`/api/category/${categoryId}`);
          console.log("Category with subcategories:", response);
        }

        let subs = [];

        if (response) {
          if (Array.isArray(response)) {
            subs = response;
          } else if (response.data && Array.isArray(response.data)) {
            subs = response.data;
          } else if (
            response.subCategoryList &&
            Array.isArray(response.subCategoryList)
          ) {
            subs = response.subCategoryList;
          } else if (response.children && Array.isArray(response.children)) {
            subs = response.children;
          } else if (
            response.categoryList &&
            Array.isArray(response.categoryList)
          ) {
            const category = response.categoryList.find(
              (cat) => cat._id === categoryId
            );
            if (category && category.children) {
              subs = category.children;
            }
          } else {
            const category = context.catData?.find(
              (cat) => cat._id === categoryId
            );
            if (
              category &&
              category.children &&
              Array.isArray(category.children)
            ) {
              subs = category.children;
            }
          }
        }

        console.log("Processed subcategories:", subs);
        setSubCategories(subs);

        if (subs.length === 0) {
          console.log("No subcategories found for this category");
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Failed to fetch subcategories!",
        });
        setSubCategories([]);
      } finally {
        setLoadingSubCategories(false);
      }
    }
  };

  // Handle subcategory selection
  const handleSubCategoryChange = (e) => {
    setSelectedSubCategory(e.target.value);
    console.log("Subcategory selected:", e.target.value);
  };

  // Submit form with better validation and error handling
  const addBanner = async (e) => {
    e.preventDefault();

    console.log("Form submitted");
    console.log("Previews:", previews);
    console.log("Selected category:", selectedCategory);
    console.log("Selected subcategory:", selectedSubCategory);

    // Validation
    if (previews.length === 0) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please upload at least one image!",
      });
      return;
    }

    if (!selectedCategory) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please select a category!",
      });
      return;
    }

    // Find selected category and subcategory details
    const selectedCat =
      context.catData && Array.isArray(context.catData)
        ? context.catData.find((cat) => cat._id === selectedCategory)
        : null;

    const selectedSubCat =
      subCategories && Array.isArray(subCategories) && selectedSubCategory
        ? subCategories.find((subCat) => subCat._id === selectedSubCategory)
        : null;

    if (!selectedCat) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Selected category not found. Please refresh and try again.",
      });
      return;
    }

    // Prepare payload
    const payload = {
      images: previews,
      catId: selectedCategory,
      catName: selectedCat?.name || "",
      subCatId: selectedSubCategory || "",
      subCatName: selectedSubCat?.subCat || selectedSubCat?.name || "",
    };

    console.log("Submitting banner with payload:", payload);

    try {
      setIsLoading(true);

      const response = await postData("/api/banners/create", payload);
      console.log("Banner creation response:", response);

      if (response && response.success !== false) {
        context.setAlertBox({
          open: true,
          error: false,
          msg: response.message || "Banner created successfully!",
        });

        // Clear form
        setPreviews([]);
        setSelectedCategory("");
        setSelectedSubCategory("");
        setSubCategories([]);

        // Navigate to banners list
        setTimeout(() => {
          navigate("/banners/list");
        }, 1000);
      } else {
        throw new Error(
          response?.message || response?.error || "Failed to create banner"
        );
      }
    } catch (err) {
      console.error("Create banner error:", err);

      let errorMessage = "Something went wrong while saving!";

      if (err.response) {
        errorMessage =
          err.response.data?.message ||
          err.response.data?.error ||
          `Server error: ${err.response.status}`;
      } else if (err.message) {
        errorMessage = err.message;
      }

      context.setAlertBox({
        open: true,
        error: true,
        msg: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="card shadow mybreadcrumb border-0 w-100 flex-row p-4 align-items-center justify-content-between">
        <h5 className="mb-0">Add Banner</h5>
        <div role="presentation">
          <Breadcrumbs aria-label="breadcrumb">
            <StyledBreadcrumb
              component={Link}
              to="/"
              label="Dashboard"
              icon={<HomeIcon fontSize="small" />}
            />
            <StyledBreadcrumb
              label="Banners"
              component={Link}
              to="/banners/list"
            />
            <StyledBreadcrumb label="Add" />
          </Breadcrumbs>
        </div>
      </div>

      <form className="form" onSubmit={addBanner}>
        <div className="card p-4 mt-4">
          <h5 className="mb-4">Banner Details</h5>

          {/* Debug Information (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-3 p-2 bg-light rounded">
              <small>
                <strong>Debug Info:</strong>
                <br />
                Categories loaded: {context.catData?.length || 0} | Categories
                loading: {categoriesLoading ? "Yes" : "No"} | Subcategories:{" "}
                {subCategories.length} | Selected Cat: {selectedCategory} |
                Selected SubCat: {selectedSubCategory} | Images:{" "}
                {previews.length}
                <br />
                <strong>Previews URLs:</strong>
                <br />
                {previews.map((url, i) => (
                  <div
                    key={i}
                    style={{ fontSize: "10px", wordBreak: "break-all" }}
                  >
                    {i + 1}: {url}
                  </div>
                ))}
              </small>
            </div>
          )}

          {/* Show loading state for categories */}
          {(categoriesLoading ||
            !context.catData ||
            context.catData.length === 0) && (
            <div className="text-center mb-4">
              <CircularProgress size={30} />
              <p className="mt-2 mb-0">Loading categories...</p>
            </div>
          )}

          {/* Category and Subcategory Selection */}
          <div className="row mb-4">
            <div className="col-md-6">
              <FormControl fullWidth>
                <InputLabel id="category-select-label">
                  Select Category *
                </InputLabel>
                <Select
                  labelId="category-select-label"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  label="Select Category *"
                  disabled={isLoading || categoriesLoading}
                >
                  <MenuItem value="">
                    <em>Choose Category</em>
                  </MenuItem>
                  {context.catData &&
                  Array.isArray(context.catData) &&
                  context.catData.length > 0 ? (
                    context.catData.map((cat) => (
                      <MenuItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>
                      <em>
                        {categoriesLoading
                          ? "Loading categories..."
                          : "No categories found"}
                      </em>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </div>

            <div className="col-md-6">
              <FormControl fullWidth>
                <InputLabel id="subcategory-select-label">
                  Select Subcategory (Optional)
                </InputLabel>
                <Select
                  labelId="subcategory-select-label"
                  value={selectedSubCategory}
                  onChange={handleSubCategoryChange}
                  label="Select Subcategory (Optional)"
                  disabled={
                    isLoading || loadingSubCategories || !selectedCategory
                  }
                >
                  <MenuItem value="">
                    <em>Choose Subcategory</em>
                  </MenuItem>
                  {subCategories &&
                  Array.isArray(subCategories) &&
                  subCategories.length > 0 ? (
                    subCategories.map((subCat) => (
                      <MenuItem key={subCat._id} value={subCat._id}>
                        {subCat.name ||
                          subCat.subCat ||
                          subCat.title ||
                          "Unnamed"}
                      </MenuItem>
                    ))
                  ) : selectedCategory ? (
                    <MenuItem disabled>
                      <em>
                        {loadingSubCategories
                          ? "Loading..."
                          : "No subcategories found"}
                      </em>
                    </MenuItem>
                  ) : (
                    <MenuItem disabled>
                      <em>Select category first</em>
                    </MenuItem>
                  )}
                </Select>
                {loadingSubCategories && (
                  <div className="text-center mt-2">
                    <CircularProgress size={20} />
                    <span className="ml-2">Loading subcategories...</span>
                  </div>
                )}
              </FormControl>
            </div>
          </div>

          <h5 className="mb-4">Upload Banner Images</h5>
          <div className="imagesUploadSec">
            <div
              className="d-flex align-items-center"
              style={{ flexWrap: "wrap", gap: "15px" }}
            >
              {/* Display uploaded images with improved error handling */}
              {previews &&
                previews.length > 0 &&
                previews.map((img, index) => {
                  console.log(`Rendering image ${index}:`, img);
                  return (
                    <div
                      className="uploadBox"
                      key={`preview-${index}-${img}`} // Better key
                      style={{
                        position: "relative",
                        width: "120px",
                        height: "120px",
                        border: "2px solid #ddd",
                        borderRadius: "8px",
                        overflow: "hidden",
                        backgroundColor: "#f5f5f5",
                      }}
                    >
                      <LazyLoadImage
                        src={img}
                        alt={`Banner preview ${index + 1}`}
                        effect="blur"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                        onError={(e) => {
                          console.error(
                            `Failed to load image at index ${index}:`,
                            img
                          );
                          // Show a placeholder or error state
                          e.target.style.display = "none";
                          // You can add a placeholder div here
                        }}
                        onLoad={() => {
                          console.log(
                            `Image loaded successfully at index ${index}:`,
                            img
                          );
                        }}
                        placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik02MCA0MEMzNi45MDg2IDQwIDI4IDQ4LjkwODYgMjggNzJTMzYuOTA4NiAxMDQgNjAgMTA0QzgzLjA5MTQgMTA0IDkyIDk1LjA5MTQgOTIgNzJTODMuMDkxNCA0MCA2MCA0MFoiIGZpbGw9IiNFMEUwRTAiLz4KPHA+PC9wPgo8L3N2Zz4K"
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
                          backgroundColor: "rgba(255, 0, 0, 0.8)",
                          color: "#fff",
                          zIndex: 2,
                        }}
                      >
                        <IoCloseSharp />
                      </Button>
                    </div>
                  );
                })}

              {/* Upload box */}
              <div
                className="uploadBox"
                style={{
                  width: "120px",
                  height: "120px",
                  border: "2px dashed #ddd",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: uploading || isLoading ? "not-allowed" : "pointer",
                }}
              >
                {uploading ? (
                  <div className="progressBar text-center d-flex align-items-center justify-content-center flex-column">
                    <CircularProgress size={24} />
                    <span className="mt-2 small">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={onChangeFile}
                      name="images"
                      id="banner-image-upload"
                      style={{ display: "none" }}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="banner-image-upload"
                      style={{
                        cursor: isLoading ? "not-allowed" : "pointer",
                        width: "100%",
                        height: "100%",
                        opacity: isLoading ? 0.5 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                      }}
                    >
                      <FaRegImages
                        style={{ fontSize: "2rem", color: "#ccc" }}
                      />
                      <h6
                        className="mt-2 small text-center"
                        style={{ color: "#666", margin: "8px 0 0 0" }}
                      >
                        Add Images
                      </h6>
                      <small
                        style={{
                          color: "#999",
                          textAlign: "center",
                          fontSize: "10px",
                        }}
                      >
                        JPG, PNG, WEBP
                      </small>
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Show current image count */}
            {previews.length > 0 && (
              <div className="mt-3">
                <small className="text-muted">
                  {previews.length} image{previews.length !== 1 ? "s" : ""}{" "}
                  selected
                </small>
              </div>
            )}
          </div>

          <div className="mt-4">
            <Button
              type="submit"
              variant="contained"
              disabled={
                isLoading ||
                uploading ||
                previews.length === 0 ||
                !selectedCategory ||
                categoriesLoading
              }
              fullWidth
              size="large"
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} style={{ marginRight: "10px" }} />
                  Creating Banner...
                </>
              ) : (
                `Create Banner (${previews.length} image${
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

export default AddBanner;
