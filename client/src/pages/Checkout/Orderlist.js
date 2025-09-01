import React, { useState, useEffect, useContext, useCallback } from "react";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";
import io from "socket.io-client";
import "./orderlist.css";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Skeleton,
  TablePagination,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Badge,
  Fab,
  Snackbar,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  WifiOff as WifiOffIcon,
  Wifi as WifiIcon,
} from "@mui/icons-material";

const OrderList = () => {
  const context = useContext(MyContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [statusUpdateCount, setStatusUpdateCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeUpdate, setRealtimeUpdate] = useState(null);
  const [showRealtimeSnackbar, setShowRealtimeSnackbar] = useState(false);

  // Get current user
  const currentUser = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (currentUser?.userId) {
      const newSocket = io(
        process.env.REACT_APP_API_URL || "http://localhost:3001"
      );
      setSocket(newSocket);

      // Connection event handlers
      newSocket.on("connect", () => {
        console.log("Connected to WebSocket server");
        setIsConnected(true);
        // Join user room for personalized updates
        newSocket.emit("join_user_room", currentUser.userId);
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from WebSocket server");
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("WebSocket connection error:", error);
        setIsConnected(false);
      });

      // Listen for real-time order status updates
      newSocket.on("order_status_updated", (data) => {
        console.log("Received real-time order update:", data);

        // Update the specific order in state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === data.orderId
              ? { ...order, orderStatus: data.newStatus }
              : order
          )
        );

        // Store update info for snackbar
        setRealtimeUpdate({
          orderId: data.orderId,
          newStatus: data.newStatus,
          message: data.message || `Order status updated to: ${data.newStatus}`,
        });

        setShowRealtimeSnackbar(true);
        setStatusUpdateCount((prev) => prev + 1);
        setLastUpdated(new Date());
      });

      // Listen for test notifications
      newSocket.on("test_notification", (data) => {
        console.log("Received test notification:", data);
        if (context?.setAlertBox) {
          context.setAlertBox({
            open: true,
            error: false,
            msg: data.message,
          });
        }
      });

      // Cleanup on unmount
      return () => {
        newSocket.disconnect();
      };
    }
  }, [currentUser?.userId, context]);

  // Fetch orders with improved error handling
  const fetchOrders = useCallback(
    async (showLoading = true) => {
      if (!currentUser?.userId) {
        if (context?.setAlertBox) {
          context.setAlertBox({
            open: true,
            error: true,
            msg: "Please login to view your orders!",
          });
        }
        return;
      }

      if (showLoading) setIsLoading(true);
      setIsRefreshing(true);

      try {
        const response = await fetchDataFromApi(
          `/api/orders/user/${currentUser.userId}`
        );

        let orderData = [];
        if (Array.isArray(response)) {
          orderData = response;
        } else if (response && Array.isArray(response.orderList)) {
          orderData = response.orderList;
        } else if (
          response &&
          response.success &&
          Array.isArray(response.result)
        ) {
          orderData = response.result;
        }

        // Sort orders by date (newest first)
        const sortedOrders = orderData.sort((a, b) => {
          const dateA = new Date(
            a.date || a.orderDate || a.createdAt || a.dateCreated
          );
          const dateB = new Date(
            b.date || b.orderDate || b.createdAt || b.dateCreated
          );
          return dateB - dateA;
        });

        setOrders(sortedOrders);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching orders:", error);
        if (context?.setAlertBox) {
          context.setAlertBox({
            open: true,
            error: true,
            msg: "Failed to load orders. Please try again.",
          });
        }
      } finally {
        if (showLoading) setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentUser, context]
  );

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchOrders(false);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Close realtime update snackbar
  const handleCloseRealtimeSnackbar = () => {
    setShowRealtimeSnackbar(false);
    setRealtimeUpdate(null);
  };

  // Get status color and icon with all possible status values
  const getStatusInfo = (status) => {
    const statusLower = status?.toLowerCase() || "pending";
    switch (statusLower) {
      case "delivered":
      case "completed":
        return {
          color: "success",
          icon: <CheckCircleIcon fontSize="small" />,
          displayText: "Delivered",
        };
      case "shipped":
      case "shipping":
        return {
          color: "info",
          icon: <ShippingIcon fontSize="small" />,
          displayText: "Shipped",
        };
      case "cancelled":
      case "canceled":
        return {
          color: "error",
          icon: <CancelIcon fontSize="small" />,
          displayText: "Cancelled",
        };
      case "processing":
        return {
          color: "warning",
          icon: <PendingIcon fontSize="small" />,
          displayText: "Processing",
        };
      case "confirmed":
        return {
          color: "primary",
          icon: <CheckCircleIcon fontSize="small" />,
          displayText: "Confirmed",
        };
      case "pending":
      default:
        return {
          color: "default",
          icon: <AssignmentIcon fontSize="small" />,
          displayText: "Pending",
        };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Get product names from items or products array
  const getProductNames = (order) => {
    const items = order.items || order.products || [];
    if (!Array.isArray(items)) return "N/A";
    return items
      .map(
        (item) =>
          item.productTitle ||
          item.productName ||
          item.name ||
          "Unknown Product"
      )
      .join(", ");
  };

  // Handle view order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <TableContainer component={Paper} className="order-table-container">
      <Table>
        <TableHead>
          <TableRow>
            {[
              "Order ID",
              "Payment ID",
              "Products",
              "Phone",
              "Address",
              "Pincode",
              "Total",
              "Email",
              "Status",
              "Date",
              "Actions",
            ].map((header) => (
              <TableCell key={header} className="table-header">
                <Skeleton variant="text" width="100%" height={24} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {[1, 2, 3, 4, 5].map((row) => (
            <TableRow key={row}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((cell) => (
                <TableCell key={cell}>
                  <Skeleton variant="text" width="100%" height={20} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (isLoading) {
    return (
      <div className="orderlist-container">
        <div className="orderlist-header">
          <Typography variant="h4" component="h1" className="page-title">
            My Orders
          </Typography>
          <Typography variant="body1" className="page-subtitle">
            Track and manage your order history
          </Typography>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="orderlist-container">
        <div className="orderlist-header">
          <Typography variant="h4" component="h1" className="page-title">
            My Orders
          </Typography>
          <Typography variant="body1" className="page-subtitle">
            Track and manage your order history
          </Typography>
        </div>
        <Card className="no-orders-card">
          <CardContent className="no-orders-content">
            <AssignmentIcon className="no-orders-icon" />
            <Typography variant="h6" className="no-orders-title">
              No Orders Found
            </Typography>
            <Typography variant="body2" className="no-orders-text">
              You haven't placed any orders yet. Start shopping to see your
              orders here!
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate pagination
  const paginatedOrders = orders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <div className="orderlist-container">
      <div className="orderlist-header">
        <Typography variant="h4" component="h1" className="page-title">
          My Orders
          {isConnected ? (
            <Tooltip title="Real-time updates enabled">
              <WifiIcon style={{ marginLeft: 8, color: "#4caf50" }} />
            </Tooltip>
          ) : (
            <Tooltip title="Real-time updates unavailable">
              <WifiOffIcon style={{ marginLeft: 8, color: "#f44336" }} />
            </Tooltip>
          )}
        </Typography>
        <Typography variant="body1" className="page-subtitle">
          Track and manage your order history ({orders.length} total orders)
        </Typography>
        <Typography variant="caption" className="last-updated">
          Last updated: {formatDate(lastUpdated)}
          {statusUpdateCount > 0 && (
            <Chip
              size="small"
              label={`${statusUpdateCount} updates`}
              color="primary"
              style={{ marginLeft: 8 }}
            />
          )}
        </Typography>
      </div>

      {/* Floating Refresh Button */}
      <Fab
        color="primary"
        size="small"
        onClick={handleManualRefresh}
        disabled={isRefreshing}
        style={{
          position: "fixed",
          top: "100px",
          right: "20px",
          zIndex: 1000,
        }}
        title="Refresh Orders"
      >
        {isRefreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
      </Fab>

      <TableContainer component={Paper} className="order-table-container">
        <Table className="order-table" aria-label="orders table">
          <TableHead>
            <TableRow>
              <TableCell className="table-header">Order ID</TableCell>
              <TableCell className="table-header">Payment ID</TableCell>
              <TableCell className="table-header">Products</TableCell>
              <TableCell className="table-header">Phone Number</TableCell>
              <TableCell className="table-header">Address</TableCell>
              <TableCell className="table-header">Pincode</TableCell>
              <TableCell className="table-header">Total Amount</TableCell>
              <TableCell className="table-header">Email</TableCell>
              <TableCell className="table-header">Status</TableCell>
              <TableCell className="table-header">Date</TableCell>
              <TableCell className="table-header">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedOrders.map((order) => {
              const statusInfo = getStatusInfo(
                order.orderStatus || order.status
              );
              const address = order.shippingAddress || {};

              return (
                <TableRow key={order._id || order.id} className="order-row">
                  <TableCell className="order-cell">
                    <Typography variant="body2" className="order-id">
                      #{(order._id || order.id || "").slice(-8).toUpperCase()}
                    </Typography>
                  </TableCell>

                  <TableCell className="order-cell">
                    <Typography variant="body2" className="payment-id">
                      {order.paymentId
                        ? `#${order.paymentId.slice(-8)}`
                        : "Pending"}
                    </Typography>
                  </TableCell>

                  <TableCell className="order-cell">
                    <Tooltip title={getProductNames(order)}>
                      <Typography variant="body2" className="products-cell">
                        {getProductNames(order).length > 30
                          ? `${getProductNames(order).substring(0, 30)}...`
                          : getProductNames(order)}
                      </Typography>
                    </Tooltip>
                  </TableCell>

                  <TableCell className="order-cell">
                    <Typography variant="body2">
                      {order.phoneNumber || address.phoneNumber || "N/A"}
                    </Typography>
                  </TableCell>

                  <TableCell className="order-cell">
                    <Tooltip
                      title={`${
                        address.streetAddressLine1 || order.address || ""
                      }, ${address.city || ""}, ${address.state || ""}`}
                    >
                      <Typography variant="body2" className="address-cell">
                        {address.city && address.state
                          ? `${address.city}, ${address.state}`
                          : order.address || "N/A"}
                      </Typography>
                    </Tooltip>
                  </TableCell>

                  <TableCell className="order-cell">
                    <Typography variant="body2">
                      {order.pincode || address.zipCode || "N/A"}
                    </Typography>
                  </TableCell>

                  <TableCell className="order-cell">
                    <Typography variant="body2" className="total-amount">
                      ₹
                      {parseFloat(
                        order.amount ||
                          order.orderDetails?.total ||
                          order.total ||
                          order.totalAmount ||
                          0
                      ).toFixed(2)}
                    </Typography>
                  </TableCell>

                  <TableCell className="order-cell">
                    <Typography variant="body2" className="email-cell">
                      {(order.email || order.userEmail || "N/A").length > 20
                        ? `${(
                            order.email ||
                            order.userEmail ||
                            "N/A"
                          ).substring(0, 20)}...`
                        : order.email || order.userEmail || "N/A"}
                    </Typography>
                  </TableCell>

                  <TableCell className="order-cell">
                    <Chip
                      icon={statusInfo.icon}
                      label={statusInfo.displayText}
                      color={statusInfo.color}
                      size="small"
                      className="status-chip"
                      variant={
                        order.orderStatus === "pending" ? "outlined" : "filled"
                      }
                    />
                  </TableCell>

                  <TableCell className="order-cell">
                    <Typography variant="body2" className="order-date">
                      {formatDate(
                        order.date || order.orderDate || order.createdAt
                      )}
                    </Typography>
                  </TableCell>

                  <TableCell className="order-cell">
                    <Tooltip title="View Order Details">
                      <IconButton
                        onClick={() => handleViewOrder(order)}
                        className="action-button"
                        size="small"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={orders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        className="table-pagination"
      />

      {/* Real-time Update Snackbar */}
      <Snackbar
        open={showRealtimeSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseRealtimeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseRealtimeSnackbar}
          severity="success"
          variant="filled"
          icon={<NotificationsIcon />}
        >
          <strong>Order Updated!</strong>
          <br />
          {realtimeUpdate?.message}
        </Alert>
      </Snackbar>

      {/* Order Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        className="order-dialog"
      >
        <DialogTitle className="dialog-title">
          Order Details - #
          {(selectedOrder?._id || selectedOrder?.id || "")
            .slice(-8)
            .toUpperCase()}
        </DialogTitle>
        <DialogContent className="dialog-content">
          {selectedOrder && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card className="detail-card">
                  <CardContent>
                    <Typography variant="h6" className="detail-section-title">
                      Order Information
                    </Typography>
                    <Box className="detail-item">
                      <strong>Order ID:</strong> #
                      {(selectedOrder._id || selectedOrder.id || "")
                        .slice(-8)
                        .toUpperCase()}
                    </Box>
                    <Box className="detail-item">
                      <strong>Payment ID:</strong>{" "}
                      {selectedOrder.paymentId || "Pending"}
                    </Box>
                    <Box className="detail-item">
                      <strong>Status:</strong>
                      <Chip
                        icon={
                          getStatusInfo(
                            selectedOrder.orderStatus || selectedOrder.status
                          ).icon
                        }
                        label={
                          getStatusInfo(
                            selectedOrder.orderStatus || selectedOrder.status
                          ).displayText
                        }
                        color={
                          getStatusInfo(
                            selectedOrder.orderStatus || selectedOrder.status
                          ).color
                        }
                        size="small"
                        style={{ marginLeft: "8px" }}
                        variant={
                          selectedOrder.orderStatus === "pending"
                            ? "outlined"
                            : "filled"
                        }
                      />
                    </Box>
                    <Box className="detail-item">
                      <strong>Order Date:</strong>{" "}
                      {formatDate(
                        selectedOrder.date ||
                          selectedOrder.orderDate ||
                          selectedOrder.createdAt
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card className="detail-card">
                  <CardContent>
                    <Typography variant="h6" className="detail-section-title">
                      Contact & Shipping
                    </Typography>
                    <Box className="detail-item">
                      <strong>Name:</strong>{" "}
                      {selectedOrder.name ||
                        selectedOrder.shippingAddress?.fullName ||
                        "N/A"}
                    </Box>
                    <Box className="detail-item">
                      <strong>Email:</strong> {selectedOrder.email || "N/A"}
                    </Box>
                    <Box className="detail-item">
                      <strong>Phone:</strong>{" "}
                      {selectedOrder.phoneNumber ||
                        selectedOrder.shippingAddress?.phoneNumber ||
                        "N/A"}
                    </Box>
                    <Box className="detail-item">
                      <strong>Address:</strong>
                      <Box component="span" className="address-detail">
                        {selectedOrder.address ||
                          selectedOrder.shippingAddress?.streetAddressLine1 ||
                          "N/A"}
                        {selectedOrder.shippingAddress?.streetAddressLine2 &&
                          `, ${selectedOrder.shippingAddress.streetAddressLine2}`}
                        <br />
                        {selectedOrder.shippingAddress?.city || "N/A"},{" "}
                        {selectedOrder.shippingAddress?.state || "N/A"}
                        <br />
                        {selectedOrder.shippingAddress?.country || "N/A"} -{" "}
                        {selectedOrder.pincode ||
                          selectedOrder.shippingAddress?.zipCode ||
                          "N/A"}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card className="detail-card">
                  <CardContent>
                    <Typography variant="h6" className="detail-section-title">
                      Ordered Items
                    </Typography>
                    <div className="ordered-items">
                      {(
                        selectedOrder.items ||
                        selectedOrder.products ||
                        []
                      ).map((item, index) => (
                        <div key={index} className="ordered-item">
                          <div className="item-info">
                            <Typography
                              variant="subtitle2"
                              className="item-name"
                            >
                              {item.productTitle ||
                                item.productName ||
                                item.name ||
                                "Unknown Product"}
                            </Typography>
                            <Typography
                              variant="body2"
                              className="item-details"
                            >
                              Quantity: {item.quantity} × ₹{item.price}
                              {item.selectedSize && (
                                <span> | Size: {item.selectedSize}</span>
                              )}
                            </Typography>
                          </div>
                          <Typography
                            variant="subtitle2"
                            className="item-total"
                          >
                            ₹
                            {(
                              parseFloat(item.price) * parseInt(item.quantity)
                            ).toFixed(2)}
                          </Typography>
                        </div>
                      ))}
                    </div>
                    <div className="order-total-section">
                      <div className="total-row final-total">
                        <span>
                          <strong>Total Amount:</strong>
                        </span>
                        <span>
                          <strong>
                            ₹
                            {(
                              selectedOrder.amount ||
                              selectedOrder.orderDetails?.total ||
                              selectedOrder.total ||
                              selectedOrder.totalAmount ||
                              0
                            ).toFixed(2)}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button
            onClick={handleCloseDialog}
            color="primary"
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OrderList;
