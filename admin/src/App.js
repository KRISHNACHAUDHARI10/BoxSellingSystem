import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Deshbord from "./pages/Home/Deshbord/dashbordBox";
import "bootstrap/dist/css/bootstrap.min.css";
import Hedar from "./components/Hedar";
import UserList from "./pages/Home/Users/user";
import Slidebar from "./components/Sidebar";
import { createContext, useEffect, useState } from "react";
import SignUp from "./pages/Home/SignUp";
import EditBannerlist from "./pages/Banner/EditBannerlist";
import EmailsList from "./pages/Home/email/emails";
import Contectlist from "./pages/Home/Contect/Contectlist";
import CategoryList from "./pages/Home/Category/CategoryList";
import Login from "./pages/Home/Login";
import ProductUpload from "./pages/Home/products/addproduct";
import NotFound from "./pages/Home/Notfound";
import ProductDetails from "./pages/Home/Productdetails/index";
import Addhomeslider from "./components/Sidebar/addhomeslider";
import Product from "./pages/Home/Prodcut";
import ProtectedRoute from "./pages/Home/Login/ProtectedRoute";
import LoadingBar from "react-top-loading-bar";
import AddCategory from "./pages/Home/Category/addCategory";
import AddBanner from "./pages/Banner/addbanner";
import { fetchDataFromApi } from "./utils/api";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import EditCategory from "./pages/Home/Category/EditCategory";
import SubCategoryList from "./pages/Home/Category/SubCategoryList";
import AddSubCategory from "./pages/Home/Category/addSubCategory";
import EditProduct from "./pages/Home/products/EditProduct";
import Addpoductweight from "./pages/Home/products/addProductWeight";
import SliderList from "./components/Sidebar/sliderlist";
import EditSliderList from "./components/Sidebar/Editsliderlist";
import Order from "./pages/Home/Orderlist.js/order";
import Bannerlist from "./pages/Banner/Bannerlist";
const Mycontext = createContext();

function App() {
  const [isToggleSlidebar, setisToggleSlidebar] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isHideSliderAndHeader, setisHideSliderAndHeader] = useState(false);
  const [themeMode, setThemeMode] = useState(true);
  const [progress, setProgress] = useState(false);
  const [catData, setCatData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [user, setUser] = useState(null); // Initialize as null
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isLoading, setIsLoading] = useState(false);
  const [alertBox, setAlertBox] = useState({
    open: false,
    msg: "",
    error: false,
  });

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setAlertBox({ open: false, msg: "", error: false });
  };

  // Fetch categories function
  const fetchCategory = async () => {
    try {
      setProgress(30);
      console.log("Fetching categories from API...");

      const res = await fetchDataFromApi("/api/category");
      console.log("Categories API response:", res);

      let categories = [];
      if (res) {
        if (Array.isArray(res)) {
          categories = res;
        } else if (res.categoryList && Array.isArray(res.categoryList)) {
          categories = res.categoryList;
        } else if (res.data && Array.isArray(res.data)) {
          categories = res.data;
        } else if (res.success && res.categoryList) {
          categories = res.categoryList;
        } else if (res.success && res.data) {
          categories = res.data;
        }
      }

      console.log("Processed categories:", categories);
      setCatData(categories);
      setProgress(100);
      return categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      setAlertBox({
        open: true,
        error: true,
        msg: "Failed to fetch categories: " + error.message,
      });
      setCatData([]);
      setProgress(100);
      return [];
    }
  };

  const fetchCountries = () => {
    setProgress(30);

    fetch("https://restcountries.com/v3.1/all?fields=name")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((res) => {
        console.log("App.js received raw country data:", res);
        setCountryData(res);
        setProgress(100);
      })
      .catch((error) => {
        console.error("Error fetching countries in App.js:", error);
        setAlertBox({
          open: true,
          msg: `Failed to fetch countries: ${error.message}`,
          error: true,
        });
        setProgress(100);
      });
  };

  // ✅ FIXED: Check for existing user session on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLogin(true);
        console.log("App.js - Loaded existing user session:", parsedUser);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        // Clear corrupted data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setIsLogin(false);
      }
    } else {
      setUser(null);
      setIsLogin(false);
    }
  }, []); // Run only once on app load

  useEffect(() => {
    if (themeMode) {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
      localStorage.setItem("themeMode", "light");
    } else {
      document.body.classList.remove("light");
      document.body.classList.add("dark");
      localStorage.setItem("themeMode", "dark");
    }
  }, [themeMode]);

  // ✅ FIXED: Add setUser to context values
  const values = {
    isToggleSlidebar,
    isLogin,
    setIsLogin,
    setisToggleSlidebar,
    isHideSliderAndHeader,
    setisHideSliderAndHeader,
    themeMode,
    setThemeMode,
    progress,
    setProgress,
    catData,
    setCatData,
    countryData,
    setCountryData,
    fetchCategory,
    fetchCountries,
    alertBox,
    setAlertBox,
    user,
    setUser, // ✅ ADD THIS - This was missing!
    isLoading,
    setIsLoading,
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    fetchCategory();
    fetchCountries();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Mycontext.Provider value={values}>
      <BrowserRouter>
        <LoadingBar
          color="#f11946"
          progress={progress}
          onLoaderFinished={() => setProgress(0)}
          className="topLoadingBar"
        />

        <Snackbar
          open={alertBox.open}
          autoHideDuration={6000}
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

        {isHideSliderAndHeader !== true && <Hedar />}
        <div className="main">
          {isHideSliderAndHeader !== true && (
            <Slidebar isToggled={isToggleSlidebar} />
          )}

          <div
            className={`content ${isHideSliderAndHeader === true && "full"} ${
              isToggleSlidebar ? "toggle" : ""
            }`}
          >
            <Routes>
              {/* Public Routes */}
              <Route path="/login" exact={true} element={<Login />} />
              <Route path="/signUp" exact={true} element={<SignUp />} />

              {/* Protected Routes - All lead to admin dashboard */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Deshbord />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/products"
                exact={true}
                element={
                  <ProtectedRoute>
                    <Product />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/category"
                exact={true}
                element={
                  <ProtectedRoute>
                    <CategoryList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/category/edit/:id"
                exact
                element={
                  <ProtectedRoute>
                    <EditCategory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/category/add"
                exact={true}
                element={
                  <ProtectedRoute>
                    <AddCategory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subCategory"
                exact={true}
                element={
                  <ProtectedRoute>
                    <SubCategoryList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subCategory/add"
                exact={true}
                element={
                  <ProtectedRoute>
                    <AddSubCategory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/upload"
                exact={true}
                element={
                  <ProtectedRoute>
                    <ProductUpload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/productsWeight/add"
                exact={true}
                element={
                  <ProtectedRoute>
                    <Addpoductweight />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/detail/:id"
                element={
                  <ProtectedRoute>
                    <ProductDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/homeslider/add"
                element={
                  <ProtectedRoute>
                    <Addhomeslider />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/homeslider/list"
                element={
                  <ProtectedRoute>
                    <SliderList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/homeslider/:id"
                element={
                  <ProtectedRoute>
                    <EditSliderList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/banners/add"
                element={
                  <ProtectedRoute>
                    <AddBanner />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/banners/list"
                element={
                  <ProtectedRoute>
                    <Bannerlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/banners/edit/:id" // Changed from /EditBannerlist/:id
                element={
                  <ProtectedRoute>
                    <EditBannerlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Order />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <UserList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contacts"
                exact
                element={
                  <ProtectedRoute>
                    <Contectlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/emails"
                exact
                element={
                  <ProtectedRoute>
                    <EmailsList />
                  </ProtectedRoute>
                }
              />
              {/* Not Found Route */}
              <Route exact={true} path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </Mycontext.Provider>
  );
}

export default App;
export { Mycontext };
