import * as React from "react";
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import HomeIcon from "@mui/icons-material/Home";
import { emphasize } from "@mui/system";
import { styled } from "@mui/material/styles";
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Mycontext } from "../../../App";
import { fetchDataFromApi, deleteData } from "../../../utils/api";
import Pagination from "@mui/material/Pagination";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// Styled MUI Breadcrumb
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

const EmailsList = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmails, setTotalEmails] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const context = useContext(Mycontext);

  // Fetch emails from API
  const fetchEmails = async (currentPage = 1) => {
    try {
      setLoading(true);
      const response = await fetchDataFromApi(
        `/api/newsletter/subscribers?page=${currentPage}&limit=10`
      );

      if (response.success) {
        setEmails(response.data.subscribers);
        setTotalPages(response.data.pagination.totalPages);
        setTotalEmails(response.data.pagination.totalSubscribers);
      } else {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Failed to fetch email subscribers",
        });
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Error fetching email subscribers",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    fetchEmails(value);
  };

  // Handle delete confirmation dialog
  const handleDeleteClick = (email) => {
    setEmailToDelete(email);
    setDeleteDialogOpen(true);
  };

  // Handle delete email - FIXED VERSION
  const handleDeleteEmail = async () => {
    if (!emailToDelete) return;

    try {
      setDeleteLoading(true);

      console.log("Attempting to delete email with ID:", emailToDelete._id);

      // Use the deleteData utility function with proper URL
      const response = await deleteData(
        `/api/newsletter/subscriber/${emailToDelete._id}`
      );

      console.log("Delete response:", response);

      if (response.success) {
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Email successfully unsubscribed",
        });

        // Remove from local state immediately for better UX
        setEmails((prevEmails) =>
          prevEmails.filter((email) => email._id !== emailToDelete._id)
        );

        // Update total count
        setTotalEmails((prev) => prev - 1);

        setDeleteDialogOpen(false);
        setEmailToDelete(null);
      } else {
        throw new Error(response.message || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting email:", error);

      context.setAlertBox({
        open: true,
        error: true,
        msg: `Failed to delete email: ${error.message}`,
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setEmailToDelete(null);
    }
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setEmailToDelete(null);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch emails on component mount
  useEffect(() => {
    fetchEmails(page);
  }, []);

  return (
    <div className="right-content w-100">
      <div className="card shadow mybreadcrumb border-0 w-100 flex-row p-4 align-items-center justify-content-between">
        <h5 className="mb-0">Email Subscribers</h5>
        <Breadcrumbs aria-label="breadcrumb">
          <StyledBreadcrumb
            component={Link}
            to="/"
            label="Home"
            icon={<HomeIcon fontSize="small" />}
          />
          <StyledBreadcrumb label="Email Subscribers" />
        </Breadcrumbs>
      </div>

      <div className="card shadow border-0 p-3 mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="hd">Newsletter Subscribers ({totalEmails})</h4>
          <Button
            variant="contained"
            onClick={() => fetchEmails(page)}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center p-5">
            <CircularProgress />
          </div>
        ) : (
          <>
            <div className="table-responsive mt-3">
              <table className="table table-bordered v-align">
                <thead className="thead-dark">
                  <tr>
                    <th>#</th>
                    <th>Email Address</th>
                    <th>Subscribed Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.length > 0 ? (
                    emails.map((subscriber, index) => (
                      <tr key={subscriber._id}>
                        <td>{(page - 1) * 10 + index + 1}</td>
                        <td>{subscriber.email}</td>
                        <td>{formatDate(subscriber.subscribedAt)}</td>
                        <td>
                          <span className="badge badge-success">Active</span>
                        </td>
                        <td>
                          <Button
                            className="error"
                            size="small"
                            onClick={() => handleDeleteClick(subscriber)}
                            disabled={deleteLoading}
                          >
                            <MdDelete />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No email subscribers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Unsubscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to unsubscribe this email address?
            <br />
            <strong>{emailToDelete?.email}</strong>
            <br />
            This action will mark the subscription as inactive.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteEmail}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={20} /> : "Unsubscribe"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EmailsList;
