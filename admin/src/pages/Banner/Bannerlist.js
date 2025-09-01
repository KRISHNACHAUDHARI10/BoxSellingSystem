import React, { useState, useEffect, useContext, useMemo } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import HomeIcon from "@mui/icons-material/Home";
import { Link, useNavigate } from "react-router-dom";
import { emphasize, styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import { FaEdit, FaTrash, FaPlus, FaSyncAlt } from "react-icons/fa";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Mycontext } from "../../App";
import { fetchDataFromApi, deleteData } from "../../utils/api";

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

const BannerList = () => {
  const context = useContext(Mycontext);
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null,
    title: "",
  });
  const [deleting, setDeleting] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());

  // Get the base URL for images
  const getBaseUrl = () => {
    return (
      process.env.REACT_APP_API_URL ||
      process.env.REACT_APP_BASE_URL ||
      "http://localhost:4000"
    );
  };

  // Improved image URL handler with memoization
  const getImageUrl = useMemo(() => {
    return (imageUrl) => {
      if (!imageUrl) return null;

      try {
        // If it's already a complete URL, return as is
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
          return imageUrl;
        }

        const baseUrl = getBaseUrl();

        // Handle different path formats
        if (imageUrl.startsWith("/uploads/")) {
          return `${baseUrl}${imageUrl}`;
        } else if (imageUrl.startsWith("uploads/")) {
          return `${baseUrl}/${imageUrl}`;
        } else if (imageUrl.startsWith("/")) {
          return `${baseUrl}${imageUrl}`;
        } else {
          return `${baseUrl}/${imageUrl}`;
        }
      } catch (error) {
        console.error("Error processing image URL:", error);
        return null;
      }
    };
  }, []);

  // Fetch banners on component mount
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching banners from /api/banners...");

      const response = await fetchDataFromApi("/api/banners");
      console.log("Banners API response:", response);

      let bannersData = [];

      if (response) {
        if (response.success === true && Array.isArray(response.data)) {
          bannersData = response.data;
        } else if (Array.isArray(response.data)) {
          bannersData = response.data;
        } else if (Array.isArray(response)) {
          bannersData = response;
        } else if (Array.isArray(response.banners)) {
          bannersData = response.banners;
        } else if (response.success === false) {
          throw new Error(
            response.message || response.error || "API returned success: false"
          );
        } else {
          console.warn("Unexpected response format:", response);
          bannersData = [];
        }
      }

      setBanners(bannersData);
      console.log(`Successfully loaded ${bannersData.length} banners`);
    } catch (error) {
      console.error("Fetch banners error:", error);

      let errorMessage = "Failed to load banners";

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 404:
            errorMessage =
              "Banners endpoint not found. Please check the API configuration.";
            break;
          case 401:
            errorMessage = "Authentication required. Please login again.";
            break;
          case 403:
            errorMessage =
              "Access denied. You don't have permission to view banners.";
            break;
          case 500:
            errorMessage =
              error.response.data?.message || "Server error occurred";
            break;
          default:
            errorMessage =
              error.response.data?.message || `Server error (${status})`;
        }
      } else if (
        error.code === "NETWORK_ERROR" ||
        error.message.includes("Network Error")
      ) {
        errorMessage = "Network error. Check if the backend server is running.";
      } else {
        errorMessage = error.message || "An unexpected error occurred";
      }

      setError(errorMessage);
      setBanners([]);

      if (context?.setAlertBox) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      setDeleting(true);
      console.log(`Deleting banner with ID: ${deleteDialog.id}`);

      const response = await deleteData(`/api/banners/${deleteDialog.id}`);
      console.log("Delete response:", response);

      let isSuccess = false;
      let successMessage = "Banner deleted successfully!";

      if (response) {
        if (response.success === true) {
          isSuccess = true;
          successMessage = response.message || successMessage;
        } else if (response.message && response.success !== false) {
          isSuccess = true;
          successMessage = response.message;
        } else if (response.status >= 200 && response.status < 300) {
          isSuccess = true;
        } else if (!response.hasOwnProperty("success") && !response.error) {
          isSuccess = true;
        }
      }

      if (isSuccess) {
        if (context?.setAlertBox) {
          context.setAlertBox({
            open: true,
            error: false,
            msg: successMessage,
          });
        }

        setBanners((prevBanners) =>
          prevBanners.filter(
            (banner) =>
              banner._id !== deleteDialog.id && banner.id !== deleteDialog.id
          )
        );
      } else {
        throw new Error(
          response?.message || response?.error || "Failed to delete banner"
        );
      }
    } catch (error) {
      console.error("Delete error:", error);

      let errorMessage = "Failed to delete banner";

      if (error.response) {
        const status = error.response.status;
        switch (status) {
          case 404:
            errorMessage = "Banner not found or already deleted";
            break;
          case 401:
            errorMessage = "Authentication failed. Please login again.";
            break;
          case 403:
            errorMessage = "You don't have permission to delete this banner";
            break;
          default:
            errorMessage =
              error.response.data?.message || `Delete failed (${status})`;
        }
      } else {
        errorMessage = error.message || "An unexpected error occurred";
      }

      if (context?.setAlertBox) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: errorMessage,
        });
      }
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, id: null, title: "" });
    }
  };

  const openDeleteDialog = (banner) => {
    const bannerId = banner._id || banner.id;
    if (!bannerId) {
      console.error("Banner ID not found:", banner);
      if (context?.setAlertBox) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Cannot delete banner: ID not found",
        });
      }
      return;
    }

    setDeleteDialog({
      open: true,
      id: bannerId,
      title: `${banner.catName || "Unknown"}${
        banner.subCatName ? ` - ${banner.subCatName}` : ""
      } Banner`,
    });
  };

  const closeDeleteDialog = () => {
    if (!deleting) {
      setDeleteDialog({ open: false, id: null, title: "" });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  };

  const handleEdit = (banner) => {
    const bannerId = banner._id || banner.id;
    if (!bannerId) {
      console.error("Banner ID not found for edit:", banner);
      if (context?.setAlertBox) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Cannot edit banner: ID not found",
        });
      }
      return;
    }
    navigate(`/banners/edit/${bannerId}`); // Changed from /banner/edit/${bannerId}
  };

  const handleRefresh = () => {
    setImageErrors(new Set()); // Clear image errors on refresh
    fetchBanners();
  };

  // Handle image load errors
  const handleImageError = (imageUrl, bannerId) => {
    console.warn(`Image load error for banner ${bannerId}:`, imageUrl);
    setImageErrors((prev) => new Set([...prev, `${bannerId}-${imageUrl}`]));
  };

  // Helper function to get banner key
  const getBannerKey = (banner) => {
    return banner._id || banner.id || banner.key || Math.random().toString(36);
  };

  // Create placeholder SVG
  const placeholderSvg =
    "data:image/svg+xml;base64," +
    btoa(`
    <svg width="60" height="40" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="60" height="40" fill="#f8f9fa"/>
      <rect x="20" y="12" width="20" height="16" rx="2" fill="#dee2e6"/>
      <circle cx="24" cy="18" r="2" fill="#adb5bd"/>
      <path d="M35 24l-3-3-2 2-3-3-7 7h15v-3z" fill="#adb5bd"/>
    </svg>
  `);

  // Memoized image component to prevent unnecessary re-renders
  const BannerImage = React.memo(({ banner, imageUrl, index }) => {
    const bannerId = getBannerKey(banner);
    const errorKey = `${bannerId}-${imageUrl}`;
    const hasError = imageErrors.has(errorKey);

    if (hasError || !imageUrl) {
      return (
        <div
          style={{
            width: "60px",
            height: "40px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            color: "#6c757d",
          }}
        >
          No Image
        </div>
      );
    }

    return (
      <LazyLoadImage
        src={imageUrl}
        alt={`Banner preview ${index + 1}`}
        effect="blur"
        placeholderSrc={placeholderSvg}
        style={{
          width: "60px",
          height: "40px",
          objectFit: "cover",
          borderRadius: "4px",
          border: "1px solid #dee2e6",
        }}
        onError={() => handleImageError(imageUrl, bannerId)}
        onLoad={() => console.log(`Image loaded: ${imageUrl}`)}
      />
    );
  });

  return (
    <>
      <div className="card shadow mybreadcrumb border-0 w-100 flex-row p-4 align-items-center justify-content-between">
        <h5 className="mb-0">Category Banners</h5>
        <div className="d-flex align-items-center">
          <Button
            variant="outlined"
            startIcon={<FaSyncAlt />}
            onClick={handleRefresh}
            disabled={loading}
            style={{ marginRight: "10px" }}
            size="small"
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<FaPlus />}
            onClick={() => navigate("/banner/add")}
            style={{ marginRight: "15px" }}
          >
            Add New Banner
          </Button>
          <div role="presentation">
            <Breadcrumbs aria-label="breadcrumb">
              <StyledBreadcrumb
                component={Link}
                to="/"
                label="Dashboard"
                icon={<HomeIcon fontSize="small" />}
              />
              <StyledBreadcrumb label="Category Banners" />
            </Breadcrumbs>
          </div>
        </div>
      </div>

      <div className="card p-4 mt-4">
        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            style={{ marginBottom: "20px" }}
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                RETRY
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <CircularProgress />
            <p className="mt-3">Loading banners...</p>
          </div>
        ) : banners.length === 0 && !error ? (
          <div className="text-center py-5">
            <h6 className="text-muted">No banners found</h6>
            <p className="text-muted">Create your first category banner!</p>
            <Button
              variant="contained"
              startIcon={<FaPlus />}
              onClick={() => navigate("/banner/add")}
              className="mt-3"
            >
              Add New Banner
            </Button>
          </div>
        ) : banners.length > 0 ? (
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }} aria-label="banners table">
              <TableHead>
                <TableRow style={{ backgroundColor: "#f8f9fa" }}>
                  <TableCell>
                    <strong>Preview</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Category</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Images Count</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Created Date</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {banners.map((banner) => {
                  const firstImageUrl =
                    banner.images && banner.images.length > 0
                      ? getImageUrl(banner.images[0])
                      : null;

                  return (
                    <TableRow
                      key={getBannerKey(banner)}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                      hover
                    >
                      <TableCell>
                        <div
                          className="d-flex align-items-center"
                          style={{ gap: "10px" }}
                        >
                          <BannerImage
                            banner={banner}
                            imageUrl={firstImageUrl}
                            index={0}
                          />
                          {banner.images && banner.images.length > 1 && (
                            <span
                              className="badge bg-secondary"
                              style={{
                                fontSize: "10px",
                                padding: "2px 6px",
                              }}
                            >
                              +{banner.images.length - 1}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div style={{ fontWeight: "500", fontSize: "14px" }}>
                            {banner.catName || "Unknown Category"}
                          </div>
                          {banner.subCatName && (
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              {banner.subCatName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${banner.images?.length || 0} images`}
                          size="small"
                          color={
                            banner.images?.length > 0 ? "primary" : "default"
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <span style={{ fontSize: "14px", color: "#666" }}>
                          {formatDate(banner.dateCreated || banner.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={banner.images?.length > 0 ? "Active" : "Empty"}
                          size="small"
                          color={
                            banner.images?.length > 0 ? "success" : "warning"
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <div
                          className="d-flex justify-content-center"
                          style={{ gap: "5px" }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(banner)}
                            title="Edit Banner"
                            style={{
                              backgroundColor: "#f3e5f5",
                              color: "#7b1fa2",
                              width: "32px",
                              height: "32px",
                            }}
                          >
                            <FaEdit size={14} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openDeleteDialog(banner)}
                            title="Delete Banner"
                            style={{
                              backgroundColor: "#ffebee",
                              color: "#d32f2f",
                              width: "32px",
                              height: "32px",
                            }}
                          >
                            <FaTrash size={14} />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        disableEscapeKeyDown={deleting}
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{deleteDialog.title}"? This action
            will permanently remove the banner and all its images. This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeDeleteDialog}
            disabled={deleting}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            color="error"
            variant="contained"
            startIcon={deleting ? <CircularProgress size={16} /> : <FaTrash />}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BannerList;
