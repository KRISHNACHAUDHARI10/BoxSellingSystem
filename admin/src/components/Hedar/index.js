import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";
import Button from "@mui/material/Button";
import { MdMenuOpen, MdOutlineMenu } from "react-icons/md";
import { CiLight } from "react-icons/ci";
import { IoMdNotificationsOutline } from "react-icons/io";
import SecurityIcon from "@mui/icons-material/Security";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Logout from "@mui/icons-material/Logout";
import AccountCircle from "@mui/icons-material/AccountCircle";
import SearchBox from "../SearchBox";
import Divider from "@mui/material/Divider";
import { useContext, useState, useEffect } from "react";
import { Mycontext } from "../../App";
import "./heder.css";

const Header = () => {
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const notificationOpen = Boolean(notificationAnchorEl);
  const accountOpen = Boolean(accountAnchorEl);
  const context = useContext(Mycontext);
  const navigate = useNavigate();

  // ✅ FIXED: Load user data from localStorage with proper key
  useEffect(() => {
    const loadUserData = () => {
      try {
        // Check "user" key first (consistent with login components)
        let storedUser = localStorage.getItem("user");

        // Fallback to "admin" key if "user" doesn't exist
        if (!storedUser) {
          storedUser = localStorage.getItem("admin");
        }

        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log("Header - Loaded user data:", userData); // Debug log

          setCurrentUser(userData);
          context.setUser(userData);
          context.setIsLogin(true);
        } else {
          console.log("Header - No user data found in localStorage"); // Debug log
          setCurrentUser(null);
          context.setIsLogin(false);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        setCurrentUser(null);
        context.setIsLogin(false);
      }
    };

    loadUserData();

    // Also listen for storage changes (if user logs in from another tab)
    const handleStorageChange = () => {
      loadUserData();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [context.isLogin]); // Re-run when login status changes

  // ✅ FIXED: Get first character of first name only
  const getInitials = (name) => {
    if (!name) return "U";
    const firstName = name.trim().split(" ")[0];
    return firstName.charAt(0).toUpperCase();
  };

  // Notifications handlers
  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  // Account handlers
  const handleAccountClick = (event) => {
    setAccountAnchorEl(event.currentTarget);
  };
  const handleAccountClose = () => {
    setAccountAnchorEl(null);
  };

  // ✅ FIXED: Logout function - clear all storage keys
  const logout = () => {
    setAccountAnchorEl(null);

    // Clear all possible stored data
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    localStorage.removeItem("token");

    // Reset context
    context.setIsLogin(false);
    context.setUser(null);

    // Reset local state
    setCurrentUser(null);

    // Redirect to login
    navigate("/login");
  };

  // Profile navigation
  const goToProfile = () => {
    setAccountAnchorEl(null);
    navigate("/profile");
  };

  // Debug: Log current state
  console.log("Header - Current user state:", {
    currentUser,
    isLogin: context.isLogin,
    contextUser: context.user,
  });

  return (
    <header className="d-flex align-items-center">
      <div className="container-fluid">
        <div className="row d-flex align-items-center">
          {/* Logo */}
          <div className="col-xs-3 part1">
            <Link to="/" className="d-flex align-items-center logo-link">
              <img src={logo} className="logo" alt="BoxiGo Logo" />
              <span className="ml-2 app-name">BOXDEKHO</span>
            </Link>
          </div>

          {/* Menu + Search */}
          <div className="col-xs-7 d-flex align-items-center part2 pl-4">
            <Button
              className="rounded-circle menu-button"
              onClick={() =>
                context.setisToggleSlidebar(!context.isToggleSlidebar)
              }
            >
              {context.isToggleSlidebar === false ? (
                <MdMenuOpen className="menu-icon" />
              ) : (
                <MdOutlineMenu />
              )}
            </Button>
            <SearchBox />
          </div>

          {/* Right Side: Theme/Notifications/User */}
          <div className="col-sm-5 d-flex align-items-center justify-content-end part3">
            {/* Theme Toggle */}
            <Button
              className="rounded-circle light-mode-button"
              onClick={() => context.setThemeMode(!context.themeMode)}
            >
              <CiLight />
            </Button>

            {/* Notifications - only show when logged in */}
            {context.isLogin && currentUser && (
              <Button
                className="rounded-circle notification-button"
                onClick={handleNotificationClick}
                aria-controls={
                  notificationOpen ? "notification-dropdown-menu" : undefined
                }
                aria-haspopup="true"
                aria-expanded={notificationOpen ? "true" : undefined}
              >
                <IoMdNotificationsOutline />
              </Button>
            )}

            <Menu
              anchorEl={notificationAnchorEl}
              id="notification-dropdown-menu"
              open={notificationOpen}
              className="notification-menu"
              onClose={handleNotificationClose}
              onClick={handleNotificationClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{ className: "menu-wide" }}
            >
              <div className="dropdown_list_head pl-2 pb-1">
                <h4>Orders (12)</h4>
              </div>
              <Divider className="mb-2" />
              <MenuItem
                onClick={handleNotificationClose}
                className="notify-user-row"
              >
                <div className="userImg my">
                  <Avatar sx={{ width: 40, height: 40, bgcolor: "#0858f7" }}>
                    {getInitials(currentUser?.userName)}
                  </Avatar>
                </div>
                <div className="notify-user-info ml-2">
                  <h5>
                    <b className="notify-user-name">
                      {currentUser?.userName || "User"}
                    </b>
                    <span className="notify-msg">
                      {" "}
                      added to his favorite list <b>Lev madden</b>
                    </span>
                  </h5>
                  <p className="notify-time text-sky">few seconds ago</p>
                </div>
              </MenuItem>
            </Menu>

            {/* User Auth Section */}
            {!context.isLogin || !currentUser ? (
              <div className="my-signin">
                <Link to={"/login"}>
                  <Button className="btn-lg">Sign In</Button>
                </Link>
              </div>
            ) : (
              <div className="myAccWrapper">
                <Button
                  className="myAcc d-flex align-items-center"
                  onClick={handleAccountClick}
                  aria-controls={accountOpen ? "account-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={accountOpen ? "true" : undefined}
                >
                  {/* ✅ FIXED: Avatar with proper image handling */}
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "#0858f7",
                      color: "white",
                      fontWeight: "bold",
                      marginRight: 1,
                      fontSize: "16px",
                    }}
                    src={
                      currentUser?.images && currentUser.images.length > 0
                        ? currentUser.images[0]
                        : ""
                    }
                  >
                    {(!currentUser?.images ||
                      currentUser.images.length === 0) &&
                      getInitials(currentUser?.userName)}
                  </Avatar>

                  {/* ✅ FIXED: User Info Display */}
                  <div className="userInfo">
                    <h5
                      style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}
                    >
                      {currentUser?.userName || "User"}
                    </h5>
                    <p
                      className="mb-0"
                      style={{ fontSize: "12px", opacity: 0.8 }}
                    >
                      {currentUser?.email || ""}
                    </p>
                    {currentUser?.isAdmin && (
                      <p
                        className="mb-0"
                        style={{ fontSize: "10px", color: "#0858f7" }}
                      >
                        Admin
                      </p>
                    )}
                  </div>
                </Button>

                <Menu
                  anchorEl={accountAnchorEl}
                  id="account-menu"
                  open={accountOpen}
                  onClose={handleAccountClose}
                  onClick={handleAccountClose}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuItem onClick={goToProfile}>
                    <ListItemIcon>
                      <AccountCircle fontSize="small" />
                    </ListItemIcon>
                    My Profile
                  </MenuItem>
                  <MenuItem onClick={handleAccountClose}>
                    <ListItemIcon>
                      <SecurityIcon fontSize="small" />
                    </ListItemIcon>
                    Reset Password
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={logout}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
