import React, { useState } from "react";
import { IoMdSettings, IoIosLogOut, IoIosNotifications } from "react-icons/io";
import { MdCategory, MdDashboard, MdMessage, MdEmail } from "react-icons/md";
import { FaAngleRight, FaProductHunt, FaCartArrowDown } from "react-icons/fa";
import { IoImageOutline } from "react-icons/io5";
import Button from "@mui/material/Button";
import { FaUsers } from "react-icons/fa6";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GiShoppingBag } from "react-icons/gi";
import { RiContactsBook2Fill } from "react-icons/ri";
import { toast } from "react-toastify";

const MENU_ITEMS = [
  {
    label: "Dashboard",
    icon: <MdDashboard />,
    to: "/",
    tab: 0,
    submenu: null,
  },
  {
    label: "HomeSlider",
    icon: <IoImageOutline />,
    tab: 1,
    submenu: [
      { label: "Add Homeslider", to: "/homeslider/add", tab: "1a" },
      { label: "Homeslider List", to: "/homeslider/list", tab: "1b" },
    ],
  },
  {
    label: "Products",
    icon: <FaProductHunt />,
    tab: 2,
    submenu: [
      { label: "Product List", to: "/products", tab: "2a" },
      { label: "Product View", to: "/products/detail", tab: "2b" },
      { label: "Product Upload", to: "/products/upload", tab: "2c" },
      { label: "Add ProductWeight", to: "/productsWeight/add", tab: "2d" },
    ],
  },
  {
    label: "Category",
    icon: <MdCategory />,
    tab: 3,
    submenu: [
      { label: "Add Category", to: "/category/add", tab: "3a" },
      { label: "Category List", to: "/category", tab: "3b" },
      { label: "Add Subcategory", to: "/subcategory/add", tab: "3c" },
      { label: "Subcategory List", to: "/subcategory", tab: "3d" },
    ],
  },
  {
    label: "Users",
    icon: <FaUsers />,
    to: "/users",
    tab: 4,
    submenu: null,
  },
  {
    label: "Orders",
    icon: <GiShoppingBag />,
    to: "/orders",
    tab: 5,
    submenu: null,
  },
  {
    label: "Banner",
    icon: <IoImageOutline />,
    tab: 6,
    submenu: [
      { label: "Add Banner", to: "/banners/add", tab: "6a" },
      { label: "Banners List", to: "/banners/list", tab: "6b" },
    ],
  },
  {
    label: "Contacts",
    icon: <RiContactsBook2Fill />,
    to: "/contacts",
    tab: 7,
    submenu: null,
  },
  {
    label: "Emails",
    icon: <MdEmail />,
    to: "/emails",
    tab: 8,
    submenu: null,
  },
];

const Slidebar = ({ isToggled }) => {
  const [activeTab, setActiveTab] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Set active on route change
  React.useEffect(() => {
    // Find main tab or submenu tab matching current path
    let found = false;
    for (const item of MENU_ITEMS) {
      if (item.submenu) {
        for (const sub of item.submenu) {
          if (location.pathname === sub.to) {
            setActiveTab(sub.tab);
            setOpenMenu(item.tab);
            found = true;
            break;
          }
        }
      } else if (item.to && location.pathname === item.to) {
        setActiveTab(item.tab);
        setOpenMenu(null);
        found = true;
        break;
      }
      if (found) break;
    }
  }, [location.pathname]);

  const handleTabClick = (tab, hasSubmenu) => {
    if (hasSubmenu) {
      setOpenMenu(openMenu === tab ? null : tab);
    } else {
      setActiveTab(tab);
      setOpenMenu(null);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Clear user data from localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("adminToken");

      // You can also clear any other stored data if needed
      localStorage.removeItem("cartData");
      localStorage.removeItem("wishlistData");

      // Show success message
      toast.success("Logout successful!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Small delay to show the toast before redirect
      setTimeout(() => {
        // Redirect to login page or home page
        navigate("/login"); // Change this to your desired redirect path
        // OR you can use window.location.href = "/login"; for a full page reload
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={`slidebar ${isToggled ? "toggle" : ""}`}>
      <div className="slidebar-content">
        <ul>
          {MENU_ITEMS.map((item) => (
            <li key={item.tab}>
              {item.submenu ? (
                <>
                  <Button
                    className={`w-100 sidebar-btn ${
                      openMenu === item.tab ? "active" : ""
                    }`}
                    onClick={() => handleTabClick(item.tab, true)}
                  >
                    <span className="icon">{item.icon}</span>
                    {item.label}
                    <span
                      className={`arrow ${
                        openMenu === item.tab ? "rotate-arrow" : ""
                      }`}
                    >
                      <FaAngleRight />
                    </span>
                  </Button>
                  <div
                    className={`submenuWrapper w-100 ${
                      openMenu === item.tab ? "colapse" : "colapsed"
                    }`}
                  >
                    <ul className="submenu">
                      {item.submenu.map((sub) => (
                        <li key={sub.tab}>
                          <Link
                            to={sub.to}
                            className={
                              activeTab === sub.tab ? "active-submenu" : ""
                            }
                            onClick={() => setActiveTab(sub.tab)}
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <Link to={item.to}>
                  <Button
                    className={`w-100 sidebar-btn ${
                      activeTab === item.tab ? "active" : ""
                    }`}
                    onClick={() => handleTabClick(item.tab, false)}
                  >
                    <span className="icon">{item.icon}</span>
                    {item.label}
                    <span className="arrow">
                      <FaAngleRight />
                    </span>
                  </Button>
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Logout */}
        <div className="logutWrapper">
          <div className="LogoutBox">
            <Button
              variant="contained"
              onClick={handleLogout}
              disabled={isLoggingOut}
              sx={{
                backgroundColor: isLoggingOut ? "#6c757d" : "#016cc9ff",
                "&:hover": {
                  backgroundColor: isLoggingOut ? "#6c757d" : "#c82333",
                },
                "&:disabled": {
                  backgroundColor: "#6c757d",
                },
              }}
            >
              <IoIosLogOut />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slidebar;
