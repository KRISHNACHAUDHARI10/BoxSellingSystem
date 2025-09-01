import "../header/header.css";
import logo from "../../assets/images/logo.jpg";
import {
  Search,
  MapPin,
  MapPinned,
  User,
  Heart,
  LogOut,
  X,
} from "lucide-react";
import { ShoppingCart } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import Select from "../selectdropdown/Select";
import { useEffect, useRef, useState, useContext } from "react";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import hert from "../../assets/images/heart.svg";
import cart from "../../assets/images/cart.svg";
import user from "../../assets/images/user.svg";
import Button from "@mui/material/Button";
import Nav from "./nav/Nav";
import { MyContext } from "../../../src/App";
import { useNavigate } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";
// Import toast for success message
import { toast } from "react-toastify";

const Header = () => {
  const [isOpenDropodown, setisOpenDropdown] = useState(false);
  const headerRef = useRef();
  const [headerCategories, setHeaderCategories] = useState([]);
  const [watchlistCount, setWatchlistCount] = useState(0);

  // Enhanced search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  const searchTimeout = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const {
    isLogin,
    setIsLoging,
    categories: appCategories,
    loadingCategories,
    cartItems,
    getCartData,
    countryList,
    watchlistItems, // USING watchlistItems from context
    getWatchlistData, // USING getWatchlistData from context
  } = useContext(MyContext);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recentSearches");
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing recent searches:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!loadingCategories && appCategories.length > 0) {
      setHeaderCategories(appCategories);
    }
  }, [appCategories, loadingCategories]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && getCartData) {
      getCartData();
    }
    if (token && getWatchlistData) {
      getWatchlistData();
    }
  }, [getCartData, getWatchlistData, isLogin]);

  // UPDATED: Dynamic watchlist count that updates automatically
  useEffect(() => {
    if (watchlistItems && Array.isArray(watchlistItems)) {
      setWatchlistCount(watchlistItems.length);
    }
  }, [watchlistItems]); // This will update whenever watchlistItems changes

  // Fetch search suggestions
  const fetchSearchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    setIsSearchLoading(true);
    try {
      const response = await fetchDataFromApi(
        `/api/search/suggestions?q=${encodeURIComponent(query)}`
      );
      if (response?.success) {
        setSearchSuggestions(response.data.suggestions || []);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSearchSuggestions([]);
    } finally {
      setIsSearchLoading(false);
    }
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set new timeout for debounced search
    searchTimeout.current = setTimeout(() => {
      fetchSearchSuggestions(value);
    }, 300);

    setShowSuggestions(true);
  };

  // Handle search submission
  const handleSearch = (query = null) => {
    const searchTerm = query || searchQuery.trim();

    if (!searchTerm) return;

    // Add to recent searches
    const updatedRecent = [
      searchTerm,
      ...recentSearches.filter((term) => term !== searchTerm),
    ].slice(0, 10);

    setRecentSearches(updatedRecent);
    localStorage.setItem("recentSearches", JSON.stringify(updatedRecent));

    // Navigate to search results
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    setShowSuggestions(false);
    setSearchQuery(searchTerm);
  };

  // Handle search key press
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  // Remove recent search
  const removeRecentSearch = (termToRemove) => {
    const updated = recentSearches.filter((term) => term !== termToRemove);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // UPDATED: Enhanced logout with success toast
  const handleSignOut = () => {
    try {
      // Clear all user data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("recentSearches");

      // Update login state
      setIsLoging(false);

      // Show success toast message
      toast.success("User logged out successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Close dropdown
      setisOpenDropdown(false);

      // Navigate to login page after a brief delay
      setTimeout(() => {
        navigate("/login");
      }, 500);
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error occurred during logout. Please try again.");
    }
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  const handleWishlistClick = () => {
    navigate("/watchlist");
  };

  const handleOrderTracking = () => {
    navigate("/orders");
    setisOpenDropdown(false);
  };

  const handleMyAccount = () => {
    navigate("/account");
    setisOpenDropdown(false);
  };

  const handleWishlist = () => {
    navigate("/watchlist");
    setisOpenDropdown(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        headerRef.current.classList.add("fixed");
      } else {
        headerRef.current.classList.remove("fixed");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getCartItemsCount = () => {
    if (!cartItems || !Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  return (
    <>
      <div className="headerWrapper">
        <header ref={headerRef}>
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-1 logo-wrapper">
                <img src={logo} alt="Logo" className="logo-img" />
                <span className="app-name">
                  <b>BoxDekho</b>
                </span>
              </div>

              <div className="col-sm-6 d-flex">
                <div className="header-Search d-flex align-items-center">
                  {!loadingCategories && headerCategories.length > 0 && (
                    <Select
                      data={headerCategories}
                      placeholder={"All Category"}
                      icon={false}
                    />
                  )}

                  <div className="search" ref={searchRef}>
                    <input
                      type="text"
                      placeholder="Search for products, brands, categories..."
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onKeyPress={handleSearchKeyPress}
                      onFocus={() => setShowSuggestions(true)}
                    />

                    {searchQuery && (
                      <X
                        className="search-clear cursor"
                        onClick={clearSearch}
                        size={18}
                        style={{
                          position: "absolute",
                          right: "50px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#666",
                          cursor: "pointer",
                        }}
                      />
                    )}

                    <Search
                      className="search-icon cursor"
                      onClick={() => handleSearch()}
                    />

                    {/* Search Suggestions Dropdown */}
                    {showSuggestions && (
                      <div className="search-suggestions-dropdown">
                        {isSearchLoading && (
                          <div className="suggestion-item loading">
                            <span>Searching...</span>
                          </div>
                        )}

                        {/* Search Suggestions */}
                        {searchSuggestions.length > 0 && (
                          <div className="suggestions-section">
                            <div className="section-title">Suggestions</div>
                            {searchSuggestions.map((suggestion, index) => (
                              <div
                                key={`suggestion-${index}`}
                                className="suggestion-item"
                                onClick={() => handleSearch(suggestion)}
                              >
                                <Search size={14} />
                                <span>{suggestion}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Recent Searches */}
                        {!isSearchLoading &&
                          searchQuery.length < 2 &&
                          recentSearches.length > 0 && (
                            <div className="suggestions-section">
                              <div className="section-title">
                                Recent Searches
                              </div>
                              {recentSearches
                                .slice(0, 5)
                                .map((recent, index) => (
                                  <div
                                    key={`recent-${index}`}
                                    className="suggestion-item recent-item"
                                  >
                                    <div
                                      onClick={() => handleSearch(recent)}
                                      className="recent-content"
                                    >
                                      <Search size={15} />
                                      <span>{recent}</span>
                                    </div>
                                    <X
                                      size={12}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeRecentSearch(recent);
                                      }}
                                      className="remove-recent"
                                    />
                                  </div>
                                ))}
                            </div>
                          )}

                        {/* No Results */}
                        {!isSearchLoading &&
                          searchQuery.length >= 2 &&
                          searchSuggestions.length === 0 && (
                            <div className="suggestion-item no-results">
                              No suggestions found for "{searchQuery}"
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-sm-5 d-flex align-items-center country">
                <div className="ml-auto d-flex align-items-center">
                  <div className="countryWrapper">
                    <Select
                      className="countryselet"
                      data={countryList}
                      placeholder={"Your location"}
                      icon={<MapPin style={{ opacity: "0.5" }} />}
                    />
                  </div>
                  <ClickAwayListener
                    onClickAway={() => setisOpenDropdown(false)}
                  >
                    <ul className="list list-inline mb-0 header-Tabs">
                      <li className="list-inline-item">
                        <span
                          className="compare-wrapper"
                          onClick={handleWishlistClick}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="icon-wrapper">
                            {/* <img
                              src={hert}
                              className="header-icon"
                              alt="heart Icon"
                            /> */}
                            <Heart />
                            <span className="compare-badge bg-success rounded-circle">
                              {watchlistCount}
                            </span>
                          </span>
                          <span className="compare-text">Wishlist</span>
                        </span>
                      </li>

                      <li className="list-inline-item">
                        <span
                          className="compare-wrapper"
                          onClick={handleCartClick}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="icon-wrapper">
                            <ShoppingCart />
                            <span className="compare-badge bg-success rounded-circle">
                              {getCartItemsCount()}
                            </span>
                          </span>
                          <span className="compare-text">Cart</span>
                        </span>
                      </li>

                      <li className="list-inline-item">
                        {isLogin ? (
                          <span
                            className="compare-wrapper"
                            onClick={() => setisOpenDropdown(!isOpenDropodown)}
                            style={{ cursor: "pointer" }}
                          >
                            <span className="icon-wrapper">
                              <User />
                            </span>
                            <span className="compare-text">Account</span>

                            {isOpenDropodown && (
                              <ul className="dropdownmenu">
                                <li>
                                  <Button
                                    className="align-items-center"
                                    onClick={handleMyAccount}
                                  >
                                    <User /> My Account
                                  </Button>

                                  <Button onClick={handleOrderTracking}>
                                    <MapPinned /> Order Tracking
                                  </Button>

                                  <Button onClick={handleWishlist}>
                                    <Heart /> My Wishlist
                                  </Button>

                                  <Button onClick={handleSignOut}>
                                    <LogOut /> Sign Out
                                  </Button>
                                </li>
                              </ul>
                            )}
                          </span>
                        ) : (
                          <Button
                            onClick={() => navigate("/signup")}
                            style={{
                              backgroundColor: "white",
                              color: "green",
                              border: "1px solid green",
                              padding: "8px 20px",
                              borderRadius: "20px",
                              fontWeight: "600",
                            }}
                          >
                            Sign Up
                          </Button>
                        )}
                      </li>
                    </ul>
                  </ClickAwayListener>
                </div>
              </div>
            </div>
          </div>
        </header>
        <Nav />
      </div>
    </>
  );
};

export default Header;
