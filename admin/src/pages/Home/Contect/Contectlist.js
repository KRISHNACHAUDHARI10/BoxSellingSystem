import * as React from "react";
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import HomeIcon from "@mui/icons-material/Home";
import { emphasize } from "@mui/system";
import { styled } from "@mui/material/styles";
import { MdDelete, MdVisibility } from "react-icons/md";
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

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [contactToView, setContactToView] = useState(null);
  const context = useContext(Mycontext);

  const itemsPerPage = 10;

  // Fetch contacts from API
  const fetchContacts = async (currentPage = 1) => {
    try {
      setLoading(true);
      const response = await fetchDataFromApi(`/api/contacts`);

      console.log("Contacts API response:", response);

      // Handle different response formats
      if (response.success && response.data) {
        // New format with pagination
        setContacts(response.data.contacts);
        setTotalPages(response.data.pagination.totalPages);
        setTotalContacts(response.data.pagination.totalContacts);
      } else if (response.contacts) {
        // Original format without pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedContacts = response.contacts.slice(startIndex, endIndex);

        setContacts(paginatedContacts);
        setTotalContacts(response.contacts.length);
        setTotalPages(Math.ceil(response.contacts.length / itemsPerPage));
      } else {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Failed to fetch contacts - Invalid response format",
        });
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Error fetching contacts: " + error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    fetchContacts(value);
  };

  // Handle delete confirmation dialog
  const handleDeleteClick = (contact) => {
    setContactToDelete(contact);
    setDeleteDialogOpen(true);
  };

  // Handle view contact message
  const handleViewClick = (contact) => {
    setContactToView(contact);
    setViewDialogOpen(true);
  };

  // Handle delete contact
  const handleDeleteContact = async () => {
    if (!contactToDelete) return;

    try {
      setDeleteLoading(true);

      console.log("Attempting to delete contact with ID:", contactToDelete._id);

      // Use the deleteData utility function
      const response = await deleteData(`/api/contacts/${contactToDelete._id}`);

      console.log("Delete response:", response);

      if (response.success) {
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Contact message successfully deleted",
        });

        // Remove from local state immediately for better UX
        setContacts((prevContacts) =>
          prevContacts.filter((contact) => contact._id !== contactToDelete._id)
        );

        // Update total count
        setTotalContacts((prev) => prev - 1);

        setDeleteDialogOpen(false);
        setContactToDelete(null);
      } else {
        throw new Error(response.message || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting contact:", error);

      context.setAlertBox({
        open: true,
        error: true,
        msg: `Failed to delete contact: ${error.message}`,
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    }
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setContactToDelete(null);
  };

  // Close view dialog
  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setContactToView(null);
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

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "new":
        return <span className="badge badge-primary">New</span>;
      case "replied":
        return <span className="badge badge-success">Replied</span>;
      case "pending":
        return <span className="badge badge-warning">Pending</span>;
      default:
        return <span className="badge badge-secondary">Unknown</span>;
    }
  };

  // Fetch contacts on component mount
  useEffect(() => {
    fetchContacts(page);
  }, []);

  return (
    <div className="right-content w-100">
      <div className="card shadow mybreadcrumb border-0 w-100 flex-row p-4 align-items-center justify-content-between">
        <h5 className="mb-0">Contact Messages</h5>
        <Breadcrumbs aria-label="breadcrumb">
          <StyledBreadcrumb
            component={Link}
            to="/"
            label="Home"
            icon={<HomeIcon fontSize="small" />}
          />
          <StyledBreadcrumb label="Contact Messages" />
        </Breadcrumbs>
      </div>

      <div className="card shadow border-0 p-3 mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="hd">Contact Messages ({totalContacts})</h4>
          <Button
            variant="contained"
            onClick={() => fetchContacts(page)}
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
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.length > 0 ? (
                    contacts.map((contact, index) => (
                      <tr key={contact._id}>
                        <td>{(page - 1) * itemsPerPage + index + 1}</td>
                        <td>{contact.fullName}</td>
                        <td>{contact.email}</td>
                        <td>{contact.phone || "N/A"}</td>
                        <td>
                          <div
                            style={{
                              maxWidth: "200px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              cursor: "pointer",
                            }}
                            onClick={() => handleViewClick(contact)}
                            title="Click to view full message"
                          >
                            {contact.message}
                          </div>
                        </td>
                        <td>{getStatusBadge(contact.status)}</td>
                        <td>{formatDate(contact.createdAt)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              className="success"
                              size="small"
                              onClick={() => handleViewClick(contact)}
                              title="View Message"
                            >
                              <MdVisibility />
                            </Button>
                            <Button
                              className="error"
                              size="small"
                              onClick={() => handleDeleteClick(contact)}
                              disabled={deleteLoading}
                              title="Delete Message"
                            >
                              <MdDelete />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No contact messages found
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

      {/* View Message Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        aria-labelledby="view-dialog-title"
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="view-dialog-title">
          Contact Message Details
        </DialogTitle>
        <DialogContent>
          <div className="p-3">
            <div className="row mb-3">
              <div className="col-md-6">
                <strong>Full Name:</strong> {contactToView?.fullName}
              </div>
              <div className="col-md-6">
                <strong>Email:</strong> {contactToView?.email}
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <strong>Phone:</strong> {contactToView?.phone || "Not provided"}
              </div>
              <div className="col-md-6">
                <strong>Status:</strong> {getStatusBadge(contactToView?.status)}
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-12">
                <strong>Date:</strong>{" "}
                {contactToView ? formatDate(contactToView.createdAt) : ""}
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <strong>Message:</strong>
                <div className="mt-2 p-3 border rounded bg-light">
                  {contactToView?.message}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this contact message?
            <br />
            <strong>
              From: {contactToDelete?.fullName} ({contactToDelete?.email})
            </strong>
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteContact}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ContactList;
