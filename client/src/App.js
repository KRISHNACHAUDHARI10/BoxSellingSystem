import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";
import Blog from "./components/Blog/Blog.js";
import Header from "./components/header/Header";
import Watchlist from "./pages/watchlist/watchlist";
import OrderList from "./pages/Checkout/Orderlist";
import Footer from "./components/footer/footer";
import Home from "./pages/Home/index";
import About from "./pages/About";
import Listing from "./pages/Listing";
import Detailspage from "./pages/Details";
import SignUp from "./pages/Signup";

import Checkout from "./pages/Checkout/Checkout";
import SearchPage from "./pages/search";
import Notfound from "./pages/Notfound";
import LoginForm from "./pages/Signin";
import Cart from "./pages/cart";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { fetchDataFromApi, postData } from "./utils/api";
import ContactForm from "./components/contect/ContactForm";

// Import ToastContainer for watchlist notifications
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Export context
export const MyContext = createContext();

function App() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLoging] = useState(false);
  const [isAddingInCart, setIsAddingInCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [countryList, setCountryList] = useState([]);

  // ADDED: Watchlist state
  const [watchlistItems, setWatchlistItems] = useState([]);

  // Alert box state
  const [alertBox, setAlertBox] = useState({
    open: false,
    msg: "",
    error: false,
  });

  // Add country fetching function
  const getcountry = useCallback(async (url) => {
    try {
      const res = await axios.get(url);
      if (res && res.data && Array.isArray(res.data.data)) {
        setCountryList(
          res.data.data.map((item) => ({
            label: item.country,
            value: item.country,
          }))
        );
      }
    } catch (error) {
      console.log("Error fetching countries:", error.message);
    }
  }, []);

  // Memoize user data to prevent re-calculations
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  // ADDED: Watchlist data fetching
  const getWatchlistData = useCallback(async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id || user?.id || user?.userId;

    if (!token || !userId) {
      setWatchlistItems([]);
      return;
    }

    try {
      const response = await fetchDataFromApi(`/api/watchlist/${userId}`);
      if (response?.success) {
        setWatchlistItems(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      setWatchlistItems([]);
    }
  }, []);

  // ADDED: Function to refresh watchlist after adding items
  const refreshWatchlist = useCallback(() => {
    getWatchlistData();
  }, [getWatchlistData]);

  // Optimized cart data fetching
  const getCartData = useCallback(async () => {
    if (!currentUser?.userId) {
      setCartItems([]);
      return;
    }

    try {
      const res = await fetchDataFromApi(
        `/api/cart?userId=${currentUser.userId}`
      );
      console.log("Cart data fetched:", res);

      // Handle different API response formats
      let items = [];
      if (Array.isArray(res)) {
        items = res;
      } else if (res && Array.isArray(res.data)) {
        items = res.data;
      } else if (res && Array.isArray(res.cartItems)) {
        items = res.cartItems;
      } else if (res && res.success && Array.isArray(res.result)) {
        items = res.result;
      }

      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart data:", error);
      setCartItems([]);
    }
  }, [currentUser?.userId]);

  // Optimized add to cart function
  const addToCart = useCallback(
    async (items) => {
      console.log("AddToCart called with:", items);

      if (!currentUser?.userId) {
        setAlertBox({
          open: true,
          error: true,
          msg: "Please Login first",
        });
        return false;
      }

      // Validate required fields
      if (
        !items.productId ||
        !items.productTitle ||
        !items.price ||
        !items.quantity
      ) {
        console.error("Missing required cart item fields:", items);
        setAlertBox({
          open: true,
          error: true,
          msg: "Invalid product data. Please try again.",
        });
        return false;
      }

      setIsAddingInCart(true);
      setIsLoading(true);

      try {
        // Ensure data types are correct
        const cartData = {
          ...items,
          price: parseFloat(items.price),
          quantity: parseInt(items.quantity),
          subTotal: parseFloat(items.price) * parseInt(items.quantity),
          userId: currentUser.userId,
        };

        console.log("Sending cart data to API:", cartData);

        const response = await postData(`/api/cart/add`, cartData);
        console.log("API response:", response);

        if (response && response.status !== false) {
          setAlertBox({
            open: true,
            error: false,
            msg: "Item added to cart successfully!",
          });
          // Refresh cart data
          await getCartData();
          return true;
        } else {
          setAlertBox({
            open: true,
            error: true,
            msg: response?.msg || "Failed to add item to cart",
          });
          return false;
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        setAlertBox({
          open: true,
          error: true,
          msg: "Something went wrong. Please try again.",
        });
        return false;
      } finally {
        setIsLoading(false);
        setIsAddingInCart(false);
      }
    },
    [currentUser?.userId, getCartData]
  );

  // Optimized empty cart function
  const emptyCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Optimized country selection
  const selectCountry = useCallback((country) => {
    setSelectedCountry(country);
    localStorage.setItem("location", country);
  }, []);

  // Handle Snackbar close
  const handleClose = useCallback((event, reason) => {
    if (reason === "clickaway") return;
    setAlertBox((prev) => ({ ...prev, open: false }));
  }, []);

  // Fetch categories and subcategories (only once)
  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const res = await fetchDataFromApi("/api/category");

        if (!isMounted) return;

        if (res && Array.isArray(res.categoryList)) {
          setCategories(res.categoryList);

          // Collect subcategories
          const subCatArr = [];
          res.categoryList.forEach((cat) => {
            if (cat?.children?.length) {
              cat.children.forEach((subCat) => subCatArr.push(subCat));
            }
          });
          setSubCategories(subCatArr);
        } else {
          setCategories([]);
          setSubCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        if (isMounted) {
          setCategories([]);
          setSubCategories([]);
        }
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // Add useEffect to fetch countries when app loads
  useEffect(() => {
    getcountry("https://countriesnow.space/api/v0.1/countries/");
  }, [getcountry]);

  // Handle country selection from localStorage (only once)
  useEffect(() => {
    const location = localStorage.getItem("location");
    if (location) {
      setSelectedCountry(location);
    } else {
      setSelectedCountry("All");
      localStorage.setItem("location", "All");
    }
  }, []);

  // Handle window resize with throttling
  useEffect(() => {
    let timeoutId;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Load cart data when user changes
  useEffect(() => {
    if (currentUser?.userId) {
      getCartData();
      setIsLoging(true);
    } else {
      setCartItems([]);
      setIsLoging(false);
    }
  }, [currentUser?.userId, getCartData]);

  // ADDED: Load watchlist data when user changes
  useEffect(() => {
    if (currentUser?.userId) {
      getWatchlistData();
    } else {
      setWatchlistItems([]);
    }
  }, [currentUser?.userId, getWatchlistData]);

  // UPDATED: Memoize context value to include watchlist functionality
  const contextValue = useMemo(
    () => ({
      categories,
      setCategories,
      subCategories,
      setSubCategories,
      loadingCategories,
      windowWidth,
      selectedCountry,
      setSelectedCountry,
      selectCountry,
      alertBox,
      setAlertBox,
      isLoading,
      setIsLoading,
      addToCart,
      isLogin,
      setIsLoging,
      getCartData,
      isAddingInCart,
      setIsAddingInCart,
      emptyCart,
      cartItems,
      setCartItems,
      countryList,
      setCountryList,
      // ADDED: Watchlist functionality
      watchlistItems,
      setWatchlistItems,
      getWatchlistData,
      refreshWatchlist,
    }),
    [
      categories,
      subCategories,
      loadingCategories,
      windowWidth,
      selectedCountry,
      selectCountry,
      alertBox,
      isLoading,
      addToCart,
      isLogin,
      getCartData,
      isAddingInCart,
      emptyCart,
      cartItems,
      countryList,
      // ADDED: Watchlist dependencies
      watchlistItems,
      getWatchlistData,
      refreshWatchlist,
    ]
  );

  return (
    <MyContext.Provider value={contextValue}>
      <BrowserRouter>
        <Snackbar
          open={alertBox.open}
          autoHideDuration={5000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleClose}
            severity={alertBox.error ? "error" : "success"}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {alertBox.msg}
          </Alert>
        </Snackbar>

        <Header />
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/about" element={<About />} />
          <Route exact path="/listing" element={<Listing />} />
          <Route exact path="/details/:id" element={<Detailspage />} />
          <Route exact path="/signup" element={<SignUp />} />
          <Route exact path="/login" element={<LoginForm />} />
          <Route exact path="/Checkout" element={<Checkout />} />
          <Route exact path="/cart" element={<Cart />} />
          <Route exact path="/contacts" element={<ContactForm />} />
          <Route exact path="/orders" element={<OrderList />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route exact path="/search" element={<SearchPage />} />
          <Route exact path="/Blog" element={<Blog />} />
          <Route path="*" element={<Notfound />} />
        </Routes>
        <Footer />

        {/* ADDED: Toast Container for watchlist notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
      </BrowserRouter>
    </MyContext.Provider>
  );
}

export default App;
