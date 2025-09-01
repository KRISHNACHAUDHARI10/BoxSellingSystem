import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import Quantitybox from "../../components/quntitybox";
import "./index.css";
import { MyContext } from "../../App";
import { fetchDataFromApi, putData, deleteData } from "../../utils/api";

const Index = () => {
  const context = useContext(MyContext);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const navigate = useNavigate();

  // Use refs to prevent unnecessary re-renders
  const updateTimeoutRef = useRef(new Map()); // Store timeout IDs for debouncing
  const abortControllerRef = useRef(null);

  // Memoize user data to prevent re-renders
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  // Memoize cart calculations
  const { cartSubtotal, cartTotal, itemCount } = useMemo(() => {
    if (!cartItems || cartItems.length === 0) {
      return { cartSubtotal: 0, cartTotal: 0, itemCount: 0 };
    }

    const subtotal = cartItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + price * quantity;
    }, 0);

    return {
      cartSubtotal: subtotal,
      cartTotal: subtotal,
      itemCount: cartItems.length,
    };
  }, [cartItems]);

  // Optimized cart data fetching with abort controller
  const getCartData = useCallback(async () => {
    if (!currentUser?.userId) {
      setCartItems([]);
      return;
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetchDataFromApi(
        `/api/cart?userId=${currentUser.userId}`
      );

      console.log("Raw cart API response:", res); // Debug log

      // Handle different API response formats
      let cartData = [];
      if (Array.isArray(res)) {
        cartData = res;
      } else if (res && Array.isArray(res.data)) {
        cartData = res.data;
      } else if (res && Array.isArray(res.cartItems)) {
        cartData = res.cartItems;
      } else if (res && res.success && Array.isArray(res.result)) {
        cartData = res.result;
      } else if (res && res.success && Array.isArray(res.data)) {
        cartData = res.data;
      }

      console.log("Processed cart data:", cartData); // Debug log
      setCartItems(cartData);

      // Update context cart items
      if (context.setCartItems) {
        context.setCartItems(cartData);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching cart data:", error);
        setCartItems([]);
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Failed to load cart data",
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [currentUser?.userId, context]);

  // Initial load
  useEffect(() => {
    if (!currentUser?.userId) {
      navigate("/login");
      return;
    }

    // Use context cart data if available, otherwise fetch
    if (context.cartItems && context.cartItems.length > 0) {
      setCartItems(context.cartItems);
    } else {
      getCartData();
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Clear all pending timeouts
      updateTimeoutRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      updateTimeoutRef.current.clear();
    };
  }, [currentUser?.userId, navigate, getCartData, context.cartItems]);

  // Sync with context cart items when they change
  useEffect(() => {
    if (context.cartItems && Array.isArray(context.cartItems)) {
      setCartItems(context.cartItems);
    }
  }, [context.cartItems]);

  // Debounced quantity update - this is the key optimization
  const updateQuantity = useCallback(
    async (item, newQuantity) => {
      if (newQuantity <= 0 || !item._id) return;

      console.log("Updating quantity:", item._id, newQuantity); // Debug log

      // Clear existing timeout for this item
      if (updateTimeoutRef.current.has(item._id)) {
        clearTimeout(updateTimeoutRef.current.get(item._id));
      }

      // Immediately update UI for responsiveness
      setCartItems((prevItems) =>
        prevItems.map((cartItem) =>
          cartItem._id === item._id
            ? {
                ...cartItem,
                quantity: newQuantity,
                subTotal: parseFloat(cartItem.price) * newQuantity,
              }
            : cartItem
        )
      );

      // Update context cart items immediately
      if (context.setCartItems) {
        context.setCartItems((prevItems) =>
          prevItems.map((cartItem) =>
            cartItem._id === item._id
              ? {
                  ...cartItem,
                  quantity: newQuantity,
                  subTotal: parseFloat(cartItem.price) * newQuantity,
                }
              : cartItem
          )
        );
      }

      // Add debounced API call
      const timeoutId = setTimeout(async () => {
        setUpdatingItems((prev) => new Set(prev).add(item._id));

        try {
          const cartFields = {
            productTitle: item.productTitle,
            image: item.image,
            rating: item.rating,
            price: parseFloat(item.price),
            quantity: parseInt(newQuantity),
            subTotal: parseFloat(item.price) * parseInt(newQuantity),
            productId: item.productId,
            userId: currentUser.userId,
            selectedSize: item.selectedSize || null,
          };

          console.log("Updating cart item:", cartFields); // Debug log

          const response = await putData(`/api/cart/${item._id}`, cartFields);
          console.log("Update response:", response); // Debug log

          if (response && response.status !== false) {
            context.setAlertBox({
              open: true,
              error: false,
              msg: "Cart updated successfully!",
            });
          }

          // Remove timeout reference
          updateTimeoutRef.current.delete(item._id);
        } catch (error) {
          console.error("Error updating cart:", error);

          // Revert optimistic update on error
          setCartItems((prevItems) =>
            prevItems.map((cartItem) =>
              cartItem._id === item._id
                ? {
                    ...cartItem,
                    quantity: item.quantity,
                    subTotal: parseFloat(item.price) * item.quantity,
                  }
                : cartItem
            )
          );

          if (context.setCartItems) {
            context.setCartItems((prevItems) =>
              prevItems.map((cartItem) =>
                cartItem._id === item._id
                  ? {
                      ...cartItem,
                      quantity: item.quantity,
                      subTotal: parseFloat(item.price) * item.quantity,
                    }
                  : cartItem
              )
            );
          }

          context.setAlertBox({
            open: true,
            error: true,
            msg: "Failed to update cart item",
          });
        } finally {
          setUpdatingItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(item._id);
            return newSet;
          });
        }
      }, 500); // 500ms debounce delay

      // Store timeout reference
      updateTimeoutRef.current.set(item._id, timeoutId);
    },
    [currentUser?.userId, context]
  );

  // Optimized remove item
  const removeFromCart = useCallback(
    async (itemId) => {
      if (!window.confirm("Are you sure you want to remove this item?")) return;

      const itemToRemove = cartItems.find((item) => item._id === itemId);

      // Optimistically remove from local state
      setCartItems((prevItems) =>
        prevItems.filter((item) => item._id !== itemId)
      );

      // Update context cart items
      if (context.setCartItems) {
        context.setCartItems((prevItems) =>
          prevItems.filter((item) => item._id !== itemId)
        );
      }

      // Clear any pending updates for this item
      if (updateTimeoutRef.current.has(itemId)) {
        clearTimeout(updateTimeoutRef.current.get(itemId));
        updateTimeoutRef.current.delete(itemId);
      }

      try {
        const response = await deleteData(`/api/cart/${itemId}`);
        console.log("Delete response:", response); // Debug log

        context.setAlertBox({
          open: true,
          error: false,
          msg: "Item removed from cart!",
        });
      } catch (error) {
        console.error("Error removing from cart:", error);

        // Revert optimistic removal on error
        if (itemToRemove) {
          setCartItems((prevItems) => [...prevItems, itemToRemove]);

          if (context.setCartItems) {
            context.setCartItems((prevItems) => [...prevItems, itemToRemove]);
          }
        }

        context.setAlertBox({
          open: true,
          error: true,
          msg: "Failed to remove item",
        });
      }
    },
    [cartItems, context]
  );

  // Batch clear cart optimization
  const clearCart = useCallback(async () => {
    if (!window.confirm("Are you sure you want to clear the entire cart?"))
      return;

    const originalCartItems = [...cartItems];
    setCartItems([]); // Optimistically clear

    // Update context
    if (context.setCartItems) {
      context.setCartItems([]);
    }

    // Clear all pending timeouts
    updateTimeoutRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    updateTimeoutRef.current.clear();

    try {
      // Use Promise.allSettled instead of Promise.all for better error handling
      const deletePromises = originalCartItems.map((item) =>
        deleteData(`/api/cart/${item._id}`)
      );
      const results = await Promise.allSettled(deletePromises);

      // Check if any deletions failed
      const failedDeletions = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedDeletions.length > 0) {
        console.error("Some items failed to delete:", failedDeletions);
        // You might want to refresh the cart to get the current state
        await getCartData();
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Some items couldn't be removed. Cart refreshed.",
        });
      } else {
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Cart cleared successfully!",
        });
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      setCartItems(originalCartItems); // Revert on error

      if (context.setCartItems) {
        context.setCartItems(originalCartItems);
      }

      context.setAlertBox({
        open: true,
        error: true,
        msg: "Failed to clear cart",
      });
    }
  }, [cartItems, context, getCartData]);

  // Memoized cart item component with React.memo for performance
  const CartItem = React.memo(
    ({ item, onUpdateQuantity, onRemove, isUpdating }) => (
      <tr>
        <td>
          <div className="d-flex align-items-center">
            <div className="img">
              <img
                src={item.image}
                alt={item.productTitle}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
                loading="lazy"
                onError={(e) => {
                  e.target.src = "/placeholder-image.jpg"; // Fallback image
                }}
              />
            </div>
            <div className="info ps-4">
              <Link to={`/details/${item.productId}`}>
                <h5 style={{ fontSize: "16px", fontWeight: "600" }}>
                  {item.productTitle?.length > 50
                    ? item.productTitle.substring(0, 50) + "..."
                    : item.productTitle}
                </h5>
              </Link>
              {item.selectedSize && (
                <small className="text-muted d-block">
                  Size: {item.selectedSize}
                </small>
              )}
              <div className="d-flex align-items-center">
                <Rating
                  name="half-rating-read"
                  value={parseFloat(item.rating) || 0}
                  precision={0.5}
                  readOnly
                  size="small"
                />
                <span className="text-muted ms-2">
                  ({parseFloat(item.rating) || 0})
                </span>
              </div>
            </div>
          </div>
        </td>
        <td>
          <span className="fw-bold">₹{parseFloat(item.price).toFixed(2)}</span>
        </td>
        <td>
          <Quantitybox
            quantity={onUpdateQuantity}
            item={item}
            value={parseInt(item.quantity)}
            selectedItem={() => {}}
            disabled={false}
          />
          {isUpdating && (
            <small className="text-muted d-block">Updating...</small>
          )}
        </td>
        <td>
          <span className="fw-bold text-success">
            ₹{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
          </span>
        </td>
        <td>
          <span
            className="cursor-pointer text-danger"
            onClick={() => onRemove(item._id)}
            style={{ cursor: "pointer" }}
          >
            <DeleteOutlineIcon />
          </span>
        </td>
      </tr>
    ),
    (prevProps, nextProps) => {
      // Custom comparison function for React.memo
      return (
        prevProps.item._id === nextProps.item._id &&
        prevProps.item.quantity === nextProps.item.quantity &&
        prevProps.item.price === nextProps.item.price &&
        prevProps.isUpdating === nextProps.isUpdating
      );
    }
  );

  if (isLoading && cartItems.length === 0) {
    return (
      <div className="container-fluid text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="breadcrumbWrapper">
        <div className="container-fluid">
          <nav aria-label="breadcrumb">
            <ul className="breadcrumb breadcrumb2 mb-0">
              <li className="breadcrumb-item">
                <Link to="/" className="breadcrumb-link">
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                <span className="breadcrumb-link">Shopping Cart</span>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <section className="cartSection mb-5">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-7">
              <div className="d-flex align-items-center w-100">
                <div className="left">
                  <h2 className="hd mb-0">Your Cart</h2>
                  <p>
                    There are <span className="text-g">{itemCount}</span>{" "}
                    Product{itemCount !== 1 ? "s" : ""} in your cart
                  </p>
                </div>
                {itemCount > 0 && (
                  <span
                    className="ms-auto Clearcart d-flex align-items-center cursor-pointer"
                    onClick={clearCart}
                    style={{ cursor: "pointer", color: "#dc3545" }}
                  >
                    <DeleteOutlineIcon />
                    Clear Cart
                  </span>
                )}
              </div>

              <div className="cartWrapper mt-4">
                {itemCount === 0 ? (
                  <div className="text-center py-5">
                    <h4>Your cart is empty</h4>
                    <p className="text-muted">
                      Add some products to get started
                    </p>
                    <Link to="/">
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "white",
                          color: "green",
                          "&:hover": { backgroundColor: "#f0f0f0" },
                        }}
                      >
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Unit Price</th>
                          <th>Quantity</th>
                          <th>Subtotal</th>
                          <th>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.map((item) => (
                          <CartItem
                            key={item._id}
                            item={item}
                            onUpdateQuantity={(newQuantity) =>
                              updateQuantity(item, newQuantity)
                            }
                            onRemove={removeFromCart}
                            isUpdating={updatingItems.has(item._id)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {itemCount > 0 && (
              <div className="col-md-5 cartRightBox">
                <div className="card p-4">
                  <div className="d-flex align-items-center mb-4">
                    <h5 className="mb-0">Subtotal</h5>
                    <h4 className="ms-auto mb-0 font-weight-bold">
                      <span className="text-success">
                        ₹{cartSubtotal.toFixed(2)}
                      </span>
                    </h4>
                  </div>
                  <div className="d-flex align-items-center mb-4">
                    <h5 className="mb-0">Shipping</h5>
                    <h4 className="ms-auto mb-0 font-weight-bold">
                      <span className="text-success">Free</span>
                    </h4>
                  </div>
                  <div className="d-flex align-items-center mb-4">
                    <h5 className="mb-0">Estimate for</h5>
                    <h4 className="ms-auto mb-0 font-weight-bold">
                      <span>India</span>
                    </h4>
                  </div>
                  <hr />
                  <div className="d-flex align-items-center mb-4">
                    <h4 className="mb-0">Total</h4>
                    <h3 className="ms-auto mb-0 font-weight-bold">
                      <span className="text-success">
                        ₹{cartTotal.toFixed(2)}
                      </span>
                    </h3>
                  </div>
                  <Button
                    className="btn-success btn-lg w-100"
                    style={{
                      backgroundColor: "#28a745",
                      borderColor: "#28a745",
                      padding: "12px 24px",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                    onClick={() => navigate("/checkout")}
                    disabled={isLoading}
                  >
                    Proceed To Checkout
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
