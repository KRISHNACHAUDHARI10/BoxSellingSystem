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
import { MdDelete, MdRefresh } from "react-icons/md";
import { FiEye } from "react-icons/fi";
import { Mycontext } from "../../../App";
import { fetchDataFromApi, deleteData } from "../../../utils/api";

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

// Memoized Row Component
const UserRow = React.memo(({ user, deleteUser }) => {
  // Optimize image (Cloudinary)
  const optimizedImg = user.images?.[0]?.includes("/upload/")
    ? user.images[0].replace(
        "/upload/",
        "/upload/w_150,h_150,c_fill,q_auto,f_auto/"
      )
    : user.images?.[0];

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format phone
  const formatPhone = (phone) => {
    if (!phone) return "N/A";
    return phone;
  };

  // Truncate ID for display
  const truncateId = (id) => {
    if (!id) return "N/A";
    return `${id.substring(0, 8)}...`;
  };

  return (
    <tr key={user._id}>
      <td style={{ width: "120px", fontSize: "12px", fontFamily: "monospace" }}>
        <span title={user._id}>{truncateId(user._id)}</span>
      </td>
      <td style={{ width: "80px", textAlign: "center" }}>
        {optimizedImg ? (
          <LazyLoadImage
            alt={user.name || "User"}
            effect="blur"
            width="60"
            height="60"
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #e0e0e0",
            }}
            src={optimizedImg}
          />
        ) : (
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888",
              borderRadius: "50%",
              fontSize: "12px",
              fontWeight: "bold",
              border: "2px solid #e0e0e0",
            }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
        )}
      </td>
      <td>
        <div>
          <strong>{user.name}</strong>
          <br />
          <small style={{ color: "#666" }}>{user.email}</small>
          {(user.isAdmin || user.role === "admin") && (
            <div>
              <span
                style={{
                  padding: "2px 6px",
                  borderRadius: "10px",
                  fontSize: "10px",
                  fontWeight: "600",
                  backgroundColor: "#fff3cd",
                  color: "#856404",
                  textTransform: "uppercase",
                  marginTop: "2px",
                  display: "inline-block",
                }}
              >
                ADMIN
              </span>
            </div>
          )}
        </div>
      </td>
      <td>{formatPhone(user.phone)}</td>
      <td>
        <span
          style={{
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "500",
            backgroundColor: user.isActive !== false ? "#e8f5e8" : "#ffeaea",
            color: user.isActive !== false ? "#2d7d32" : "#d32f2f",
          }}
        >
          {user.isActive !== false ? "Active" : "Inactive"}
        </span>
      </td>
      <td>{formatDate(user.createdAt || user.date)}</td>
      <td>{formatDate(user.lastLogin)}</td>
      <td>
        <div className="action d-flex align-items-center gap-2">
          <Button
            className="secondary"
            color="primary"
            size="small"
            title={`View details for ${user.name}`}
          >
            <FiEye />
          </Button>
          <Button
            className="error"
            color="error"
            size="small"
            onClick={() => deleteUser(user._id)}
            disabled={user.isActive === false}
            title={`Delete ${user.name}`}
          >
            <MdDelete />
          </Button>
        </div>
      </td>
    </tr>
  );
});

const AdminUserList = () => {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
  });
  const context = useContext(Mycontext);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAllUsers();
  }, []);

  // Calculate stats whenever userList changes
  useEffect(() => {
    if (userList.length > 0) {
      const total = userList.length;
      const active = userList.filter((user) => user.isActive !== false).length;
      const inactive = total - active;
      const admins = userList.filter(
        (user) => user.isAdmin === true || user.role === "admin"
      ).length;

      setStats({ total, active, inactive, admins });
    } else {
      setStats({ total: 0, active: 0, inactive: 0, admins: 0 });
    }
  }, [userList]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      context.setProgress(30);

      // Try multiple endpoints to find users
      let response;
      let users = [];

      try {
        // First try: Standard users endpoint
        console.log("Trying /api/users endpoint...");
        response = await fetchDataFromApi("/api/users");
        console.log("Users API response:", response);

        if (response && !response.error) {
          if (Array.isArray(response)) {
            users = response;
          } else if (response.users && Array.isArray(response.users)) {
            users = response.users;
          } else if (response.data && Array.isArray(response.data)) {
            users = response.data;
          } else if (response.usersList && Array.isArray(response.usersList)) {
            users = response.usersList;
          }
        }
      } catch (userError) {
        console.log("Standard users endpoint failed, trying admin endpoint...");

        try {
          // Second try: Admin users endpoint
          response = await fetchDataFromApi("/api/admin/users");
          console.log("Admin users API response:", response);

          if (response && !response.error) {
            if (Array.isArray(response)) {
              users = response;
            } else if (response.users && Array.isArray(response.users)) {
              users = response.users;
            } else if (response.data && Array.isArray(response.data)) {
              users = response.data;
            }
          }
        } catch (adminError) {
          console.log("Admin endpoint failed, trying user list endpoint...");

          try {
            // Third try: User list endpoint
            response = await fetchDataFromApi("/api/user/list");
            console.log("User list API response:", response);

            if (response && !response.error) {
              if (Array.isArray(response)) {
                users = response;
              } else if (response.users && Array.isArray(response.users)) {
                users = response.users;
              } else if (response.data && Array.isArray(response.data)) {
                users = response.data;
              }
            }
          } catch (listError) {
            console.error("All user endpoints failed:", listError);
            throw listError;
          }
        }
      }

      if (users.length > 0) {
        console.log("Users loaded successfully:", users.length);
        setUserList(users);
      } else {
        console.warn("No users found in API response");
        setUserList([]);
        context.setAlertBox({
          open: true,
          msg: "No users found or unexpected data format from server",
          error: true,
        });
      }
    } catch (error) {
      console.error("Fetch users error:", error);

      let errorMessage = "Failed to fetch users";

      if (error.response) {
        errorMessage =
          error.response.data?.msg ||
          error.response.data?.message ||
          `Server error: ${error.response.status}`;

        if (error.response.status === 401) {
          errorMessage = "Authentication failed. Please login as admin.";
        } else if (error.response.status === 403) {
          errorMessage = "Access denied. Admin privileges required.";
        } else if (error.response.status === 404) {
          errorMessage =
            "Users endpoint not found. Please check your backend API.";
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      } else {
        errorMessage = error.message || "Unknown error occurred";
      }

      context.setAlertBox({
        open: true,
        msg: errorMessage,
        error: true,
      });

      setUserList([]);
    } finally {
      setLoading(false);
      context.setProgress(100);
    }
  };

  const deleteUser = async (userId) => {
    const user = userList.find((u) => u._id === userId);

    if (
      !window.confirm(
        `Are you sure you want to delete "${
          user?.name || "this user"
        }"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      console.log("=== FRONTEND DELETE DEBUG ===");
      console.log("Deleting user ID:", userId);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      context.setProgress(30);

      // Use the admin-specific delete route
      const deleteRes = await deleteData(`/api/admin/delete-user/${userId}`);
      console.log("Admin delete response:", deleteRes);

      if (deleteRes && deleteRes.error === false) {
        console.log("✅ Delete successful");

        setUserList((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, isActive: false } : user
          )
        );

        context.setAlertBox({
          open: true,
          msg: deleteRes.msg || "User deactivated successfully!",
          error: false,
        });
      } else {
        console.log("❌ Delete failed:", deleteRes);
        context.setAlertBox({
          open: true,
          msg: deleteRes.msg || "Failed to deactivate the user.",
          error: true,
        });
      }
    } catch (error) {
      console.error("=== DELETE ERROR DETAILS ===");
      console.error("Error:", error);

      let errorMessage = "Deletion failed.";
      if (error.response?.status === 403) {
        errorMessage =
          "Access denied. You need admin privileges to delete users.";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
      } else if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      }

      context.setAlertBox({
        open: true,
        msg: errorMessage,
        error: true,
      });
    } finally {
      context.setProgress(100);
    }
  };

  if (loading) {
    return (
      <div className="right-content w-100">
        <div className="card shadow border-0 p-4 text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="right-content w-100">
      <div className="card shadow mybreadcrumb border-0 w-100 flex-row p-4 align-items-center justify-content-between">
        <h5 className="mb-0">User Management</h5>
        <Breadcrumbs aria-label="breadcrumb">
          <StyledBreadcrumb
            component={Link}
            to="/"
            label="Home"
            icon={<HomeIcon fontSize="small" />}
          />
          <StyledBreadcrumb label="Users" />
          <span className="badge bg-primary ms-2">Admin Panel</span>
        </Breadcrumbs>
      </div>

      {/* Stats Cards */}
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card shadow border-0 p-3 text-center">
            <h4 className="text-primary mb-0">{stats.total}</h4>
            <small className="text-muted">Total Users</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow border-0 p-3 text-center">
            <h4 className="text-success mb-0">{stats.active}</h4>
            <small className="text-muted">Active Users</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow border-0 p-3 text-center">
            <h4 className="text-danger mb-0">{stats.inactive}</h4>
            <small className="text-muted">Inactive Users</small>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow border-0 p-3 text-center">
            <h4 className="text-warning mb-0">{stats.admins}</h4>
            <small className="text-muted">Admin Users</small>
          </div>
        </div>
      </div>

      <div className="card shadow border-0 p-3 mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="hd">All Registered Users ({userList.length})</h4>
          <Button
            variant="outlined"
            size="small"
            onClick={fetchAllUsers}
            disabled={loading}
            startIcon={<MdRefresh />}
          >
            Refresh Data
          </Button>
        </div>

        <div className="table-responsive mt-3">
          <table className="table table-bordered v-align">
            <thead className="thead-dark">
              <tr>
                <th style={{ width: "120px" }}>User ID</th>
                <th style={{ width: "80px" }}>Avatar</th>
                <th>User Info</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Last Login</th>
                <th style={{ width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userList.length > 0 ? (
                userList.map((user) => (
                  <UserRow key={user._id} user={user} deleteUser={deleteUser} />
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <div className="text-muted">
                      <p className="mb-0">No users found.</p>
                      <small>Users will appear here once they register.</small>
                      <br />
                      <small className="text-info">
                        Check browser console for API endpoint details.
                      </small>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {userList.length > 0 && (
          <div className="mt-3 text-muted small">
            <p className="mb-0">
              Displaying {stats.active} active users and {stats.inactive}{" "}
              inactive users
              <br />
              <strong>Note:</strong> Admin can view all user details including
              User IDs and manage user accounts
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserList;
