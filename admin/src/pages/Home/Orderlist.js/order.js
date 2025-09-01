import React, { useEffect, useState, useContext } from "react";
import { fetchDataFromApi, deleteData, putData } from "../../../utils/api";
import { Mycontext } from "../../../App";

const Orders = () => {
  const context = useContext(Mycontext);

  const [orderList, setOrderList] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(null); // Track which order is being updated

  const fetchOrders = async () => {
    setLoading(true);
    try {
      console.log(
        `Fetching orders from: ${process.env.REACT_APP_BASE_URL}/api/orders?page=${page}`
      );

      const res = await fetchDataFromApi(`/api/orders?page=${page}`);

      console.log("API Response:", res);

      if (res?.success) {
        setOrderList(res.orderList || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.orderList?.length || 0);
      } else {
        console.error("API returned unsuccessful response:", res);
        setOrderList([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });

      setOrderList([]);
      setTotalPages(1);
      setTotalCount(0);

      if (context?.setAlertBox) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Failed to fetch orders. Please check your connection and try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchOrders();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      delivered: { backgroundColor: "#28a745", color: "white" },
      shipped: { backgroundColor: "#17a2b8", color: "white" },
      processing: { backgroundColor: "#fd7e14", color: "white" },
      confirmed: { backgroundColor: "#007bff", color: "white" },
      pending: { backgroundColor: "#ffc107", color: "black" },
      cancelled: { backgroundColor: "#dc3545", color: "white" },
      none: { backgroundColor: "#6c757d", color: "white" },
    };
    return statusStyles[status] || statusStyles.none;
  };

  const getPaymentStatusBadge = (status) => {
    const statusStyles = {
      paid: { backgroundColor: "#28a745", color: "white" },
      pending: { backgroundColor: "#ffc107", color: "black" },
      failed: { backgroundColor: "#dc3545", color: "white" },
      refunded: { backgroundColor: "#6c757d", color: "white" },
    };
    return statusStyles[status] || statusStyles.pending;
  };

  const handleDelete = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        const result = await deleteData(`/api/orders/${orderId}`);

        if (result?.success) {
          if (context?.setAlertBox) {
            context.setAlertBox({
              open: true,
              error: false,
              msg: "Order Deleted Successfully!",
            });
          }
          fetchOrders(); // Refresh the list
        }
      } catch (error) {
        console.error("Error deleting order:", error);
        if (context?.setAlertBox) {
          context.setAlertBox({
            open: true,
            error: true,
            msg: "Failed to delete order!",
          });
        }
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // FIXED: Use putData from your API utility
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      console.log(`Updating order ${orderId} to status: ${newStatus}`);

      // Set loading state for this specific order
      setUpdatingStatus(orderId);

      // Use your existing putData utility function
      const result = await putData(`/api/orders/${orderId}/status`, {
        status: newStatus,
      });

      console.log("Status update response:", result);

      if (result?.success) {
        console.log("Order status updated successfully");

        // Optimistically update the UI immediately
        setOrderList((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, orderStatus: newStatus } : order
          )
        );

        // Show success message
        if (context?.setAlertBox) {
          context.setAlertBox({
            open: true,
            error: false,
            msg: `Order status updated to ${newStatus.toUpperCase()}`,
          });
        }
      } else {
        throw new Error(result?.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);

      // Show error message to user
      if (context?.setAlertBox) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: `Failed to update order status: ${
            error.message || "Unknown error"
          }`,
        });
      }

      // Refresh orders to ensure UI is in sync with server
      fetchOrders();
    } finally {
      // Clear loading state
      setUpdatingStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="right-content w-100">
        <div style={{ padding: "50px", textAlign: "center" }}>
          <div className="loading-spinner">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="right-content w-100">
      <div className="row dashbordBoxWrapper">
        <div className="col-md-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Orders Management</h5>
              <button
                onClick={fetchOrders}
                className="btn btn-sm btn-outline-primary"
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            <div className="card-body">
              {orderList.length === 0 && !loading ? (
                <div className="text-center py-4">
                  <h6>No orders found</h6>
                  <p className="text-muted">
                    There are no orders to display at the moment.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered v-align">
                    <thead className="thead-dark">
                      <tr>
                        <th>Order ID</th>
                        <th>Payment ID</th>
                        <th>Products</th>
                        <th>Name</th>
                        <th>Phone Number</th>
                        <th>Address</th>
                        <th>Pincode</th>
                        <th>Total Amount</th>
                        <th>Email</th>
                        <th>User ID</th>
                        <th>Order Status</th>
                        <th>Payment Status</th>
                        <th>Date Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderList.map((order, i) => (
                        <React.Fragment key={order._id}>
                          <tr>
                            <td>#{order._id?.slice(-8) || "N/A"}</td>
                            <td>
                              {order.paymentId === "pending" ||
                              !order.paymentId ? (
                                <span style={getPaymentStatusBadge("pending")}>
                                  Pending
                                </span>
                              ) : (
                                order.paymentId.slice(-8)
                              )}
                            </td>
                            <td>
                              <button
                                onClick={() => toggleOrderExpansion(order._id)}
                                style={{
                                  background: "none",
                                  border: "1px solid #007bff",
                                  color: "#007bff",
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                {order.products?.length || 0} item(s)
                                <span style={{ fontSize: "10px" }}>
                                  {expandedOrders.has(order._id) ? "▲" : "▼"}
                                </span>
                              </button>
                            </td>
                            <td>
                              {order.name ||
                                order.shippingAddress?.fullName ||
                                "N/A"}
                            </td>
                            <td>
                              {order.phoneNumber ||
                                order.shippingAddress?.phoneNumber ||
                                "N/A"}
                            </td>
                            <td>
                              {order.address ||
                                `${
                                  order.shippingAddress?.streetAddressLine1 ||
                                  ""
                                } ${
                                  order.shippingAddress?.city || ""
                                }`.trim() ||
                                "N/A"}
                            </td>
                            <td>
                              {order.pincode ||
                                order.shippingAddress?.zipCode ||
                                "N/A"}
                            </td>
                            <td>
                              ₹
                              {(
                                order.amount ||
                                order.orderDetails?.total ||
                                0
                              ).toFixed(2)}
                            </td>
                            <td>{order.email || "N/A"}</td>
                            <td>{order.userid?.slice(-6) || "N/A"}</td>
                            <td>
                              <select
                                value={order.orderStatus || "pending"}
                                onChange={(e) =>
                                  handleStatusUpdate(order._id, e.target.value)
                                }
                                disabled={updatingStatus === order._id}
                                style={{
                                  ...getStatusBadge(order.orderStatus),
                                  padding: "4px 8px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  borderRadius: "4px",
                                  border: "none",
                                  cursor:
                                    updatingStatus === order._id
                                      ? "not-allowed"
                                      : "pointer",
                                  opacity:
                                    updatingStatus === order._id ? 0.6 : 1,
                                }}
                              >
                                <option value="pending">PENDING</option>
                                <option value="confirmed">CONFIRMED</option>
                                <option value="processing">PROCESSING</option>
                                <option value="shipped">SHIPPED</option>
                                <option value="delivered">DELIVERED</option>
                                <option value="cancelled">CANCELLED</option>
                              </select>
                              {updatingStatus === order._id && (
                                <div
                                  style={{ fontSize: "10px", marginTop: "2px" }}
                                >
                                  Updating...
                                </div>
                              )}
                            </td>
                            <td>
                              <span
                                style={{
                                  ...getPaymentStatusBadge(order.paymentStatus),
                                  padding: "4px 8px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  borderRadius: "4px",
                                  textTransform: "uppercase",
                                }}
                              >
                                {order.paymentStatus || "pending"}
                              </span>
                            </td>
                            <td>{formatDate(order.date || order.createdAt)}</td>
                            <td>
                              <div className="actions d-flex align-items-center">
                                <button
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#6c757d",
                                    padding: "4px",
                                    marginRight: "4px",
                                    cursor: "pointer",
                                  }}
                                  title="View Order"
                                >
                                  👁️
                                </button>
                                <button
                                  onClick={() => handleDelete(order._id)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#dc3545",
                                    padding: "4px",
                                    cursor: "pointer",
                                  }}
                                  title="Delete Order"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Products Table */}
                          {expandedOrders.has(order._id) && order.products && (
                            <tr>
                              <td colSpan="14" style={{ padding: "0" }}>
                                <div
                                  style={{
                                    padding: "16px",
                                    backgroundColor: "#f8f9fa",
                                  }}
                                >
                                  <h6
                                    style={{
                                      marginBottom: "12px",
                                      color: "#495057",
                                    }}
                                  >
                                    Order Products:
                                  </h6>
                                  <table
                                    className="table table-bordered"
                                    style={{ marginBottom: "0" }}
                                  >
                                    <thead
                                      style={{ backgroundColor: "#e9ecef" }}
                                    >
                                      <tr>
                                        <th>Product ID</th>
                                        <th>Product Title</th>
                                        <th>Image</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>SubTotal</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {order.products.map((product, idx) => (
                                        <tr key={idx}>
                                          <td>{product.productId || "N/A"}</td>
                                          <td>
                                            <div>
                                              <strong>
                                                {product.productName || "N/A"}
                                              </strong>
                                              {product.selectedSize && (
                                                <small
                                                  style={{
                                                    display: "block",
                                                    color: "#6c757d",
                                                  }}
                                                >
                                                  Size: {product.selectedSize}
                                                </small>
                                              )}
                                            </div>
                                          </td>
                                          <td>
                                            {product.image ? (
                                              <img
                                                src={product.image}
                                                alt={product.productName}
                                                style={{
                                                  width: "50px",
                                                  height: "50px",
                                                  objectFit: "cover",
                                                  borderRadius: "4px",
                                                }}
                                                onError={(e) => {
                                                  e.target.src =
                                                    "/fallback.png";
                                                }}
                                              />
                                            ) : (
                                              <div
                                                style={{
                                                  width: "50px",
                                                  height: "50px",
                                                  backgroundColor: "#e9ecef",
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent: "center",
                                                  borderRadius: "4px",
                                                  fontSize: "12px",
                                                  color: "#6c757d",
                                                }}
                                              >
                                                No Image
                                              </div>
                                            )}
                                          </td>
                                          <td>{product.quantity || 0}</td>
                                          <td>
                                            ₹{(product.price || 0).toFixed(2)}
                                          </td>
                                          <td>
                                            ₹
                                            {(
                                              product.total ||
                                              product.price *
                                                product.quantity ||
                                              0
                                            ).toFixed(2)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "16px",
                  }}
                >
                  <p style={{ margin: 0 }}>
                    Showing {orderList.length} orders (Page {page} of{" "}
                    {totalPages})
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={page === 1}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      First
                    </button>
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Previous
                    </button>
                    <span style={{ padding: "4px 8px" }}>
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={page === totalPages}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
