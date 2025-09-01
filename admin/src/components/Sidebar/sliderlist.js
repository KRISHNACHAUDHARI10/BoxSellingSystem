import React, { useState, useEffect, useContext } from "react";
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
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
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

const SliderList = () => {
  const context = useContext(Mycontext);
  const navigate = useNavigate();

  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null,
    title: "",
  });
  const [deleting, setDeleting] = useState(false);

  // Fetch sliders on component mount
  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await fetchDataFromApi("/api/homeBanner");

      if (response && response.success) {
        setSliders(response.data || []);
      } else {
        throw new Error(response?.message || "Failed to fetch sliders");
      }
    } catch (error) {
      console.error("Fetch sliders error:", error);
      context.setAlertBox({
        open: true,
        error: true,
        msg:
          error.response?.data?.message ||
          error.message ||
          "Failed to load sliders",
      });
      setSliders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      setDeleting(true);
      const response = await deleteData(`/api/homeBanner/${deleteDialog.id}`);

      if (response && response.success) {
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Banner deleted successfully!",
        });

        // Remove the deleted item from state
        setSliders(sliders.filter((slider) => slider._id !== deleteDialog.id));
      } else {
        throw new Error(response?.message || "Failed to delete banner");
      }
    } catch (error) {
      console.error("Delete error:", error);
      context.setAlertBox({
        open: true,
        error: true,
        msg:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete banner",
      });
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, id: null, title: "" });
    }
  };

  const openDeleteDialog = (slider) => {
    setDeleteDialog({
      open: true,
      id: slider._id,
      title: `Banner with ${slider.images?.length || 0} images`,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, id: null, title: "" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEdit = (slider) => {
    navigate(`/homeslider/${slider._id}`);
  };

  return (
    <>
      <div className="card shadow mybreadcrumb border-0 w-100 flex-row p-4 align-items-center justify-content-between">
        <h5 className="mb-0">Home Banner Sliders</h5>
        <div className="d-flex align-items-center">
          <Button
            variant="contained"
            startIcon={<FaPlus />}
            onClick={() => navigate("/homeBannerSlide/add")}
            style={{ marginRight: "15px" }}
          >
            Add New Slider
          </Button>
          <div role="presentation">
            <Breadcrumbs aria-label="breadcrumb">
              <StyledBreadcrumb
                component={Link}
                to="/"
                label="Dashboard"
                icon={<HomeIcon fontSize="small" />}
              />
              <StyledBreadcrumb label="Home Banners" />
            </Breadcrumbs>
          </div>
        </div>
      </div>

      <div className="card p-4 mt-4">
        {loading ? (
          <div className="text-center py-5">
            <CircularProgress />
            <p className="mt-3">Loading sliders...</p>
          </div>
        ) : sliders.length === 0 ? (
          <div className="text-center py-5">
            <h6 className="text-muted">No sliders found</h6>
            <p className="text-muted">Create your first home banner slider!</p>
            <Button
              variant="contained"
              startIcon={<FaPlus />}
              onClick={() => navigate("/homeBannerSlide/add")}
              className="mt-3"
            >
              Add New Slider
            </Button>
          </div>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }} aria-label="sliders table">
              <TableHead>
                <TableRow style={{ backgroundColor: "#f8f9fa" }}>
                  <TableCell>
                    <strong>Preview</strong>
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
                {sliders.map((slider) => (
                  <TableRow
                    key={slider._id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    hover
                  >
                    <TableCell>
                      <div
                        className="d-flex align-items-center"
                        style={{ gap: "10px" }}
                      >
                        {slider.images && slider.images.length > 0 ? (
                          <>
                            <LazyLoadImage
                              src={slider.images[0]}
                              alt="Banner preview"
                              effect="blur"
                              style={{
                                width: "60px",
                                height: "40px",
                                objectFit: "cover",
                                borderRadius: "4px",
                                border: "1px solid #ddd",
                              }}
                              onError={(e) => {
                                e.target.src = "/placeholder-image.jpg";
                              }}
                            />
                            {slider.images.length > 1 && (
                              <span
                                className="badge bg-secondary"
                                style={{
                                  fontSize: "10px",
                                  padding: "2px 6px",
                                }}
                              >
                                +{slider.images.length - 1}
                              </span>
                            )}
                          </>
                        ) : (
                          <div
                            style={{
                              width: "60px",
                              height: "40px",
                              backgroundColor: "#f8f9fa",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              color: "#666",
                            }}
                          >
                            No Image
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${slider.images?.length || 0} images`}
                        size="small"
                        color={
                          slider.images?.length > 0 ? "primary" : "default"
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <span style={{ fontSize: "14px", color: "#666" }}>
                        {formatDate(slider.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={slider.images?.length > 0 ? "Active" : "Empty"}
                        size="small"
                        color={
                          slider.images?.length > 0 ? "success" : "warning"
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
                          onClick={() => handleEdit(slider)}
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
                          onClick={() => openDeleteDialog(slider)}
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{deleteDialog.title}"? This action
            will permanently remove the banner and all its images from
            Cloudinary. This action cannot be undone.
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

export default SliderList;
