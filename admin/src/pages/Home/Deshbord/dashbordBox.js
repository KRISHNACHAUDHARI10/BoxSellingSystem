import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { FaUserCircle, FaShoppingCart } from "react-icons/fa";
import { MdShoppingBag } from "react-icons/md";
import { Chart } from "react-google-charts";
import { fetchDataFromApi } from "../../../utils/api";

// Sample Pie Chart Data
const pieData = [
  ["Task", "Hours per Day"],
  ["Work", 9],
  ["Eat", 5],
  ["Commute", 5],
  ["Watch TV", 4],
  ["Sleep", 7],
];

const pieOptions = {
  backgroundColor: "transparent",
  chartArea: { width: "100%", height: "80%" },
  legend: { position: "right", textStyle: { color: "#333" } },
  pieHole: 0.4,
};

// Bar Chart Data
const barData = [
  ["Month", "Sales"],
  ["Jan", 65],
  ["Feb", 59],
  ["Mar", 80],
  ["Apr", 81],
  ["May", 56],
  ["Jun", 55],
  ["Jul", 40],
];

const barOptions = {
  backgroundColor: "transparent",
  chartArea: { width: "70%", height: "80%" },
  legend: { position: "none" },
  hAxis: {
    textStyle: { color: "#333" },
  },
  vAxis: {
    textStyle: { color: "#333" },
    minValue: 0,
  },
  colors: ["#2c78e5"],
};

// Total Users Dashboard Box - Dynamic
const TotalUsersBox = () => {
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        setLoading(true);
        const res = await fetchDataFromApi("/api/users/get/count");
        setUserCount(res?.userCount || 0);
      } catch (error) {
        console.error("Error fetching user count:", error);
        setUserCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCount();
  }, []);

  return (
    <Box
      className="dashboardBox"
      sx={{
        backgroundImage: `linear-gradient(to right, #1da256, #48d483)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "16px",
        borderRadius: "4px",
        margin: "0 10px",
        minWidth: "250px",
      }}
    >
      <div className="d-flex w-100">
        <div className="col1">
          <h5 className="text-white">Total Users</h5>
          <span className="text-white">
            {loading ? "Loading..." : userCount.toLocaleString()}
          </span>
        </div>
        <div className="ml-auto">
          <span className="icon">
            <FaUserCircle />
          </span>
        </div>
      </div>
    </Box>
  );
};

// Total Orders Dashboard Box - Dynamic
const TotalOrdersBox = () => {
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderCount = async () => {
      try {
        setLoading(true);
        const res = await fetchDataFromApi("/api/orders/get/count");
        setOrderCount(res?.orderCount || 0);
      } catch (error) {
        console.error("Error fetching order count:", error);
        setOrderCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderCount();
  }, []);

  return (
    <Box
      className="dashboardBox"
      sx={{
        backgroundImage: `linear-gradient(to right, #c012e2, #eb64fe)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "16px",
        borderRadius: "4px",
        margin: "0 10px",
        minWidth: "250px",
      }}
    >
      <div className="d-flex w-100">
        <div className="col1">
          <h5 className="text-white">Total Orders</h5>
          <span className="text-white">
            {loading ? "Loading..." : orderCount.toLocaleString()}
          </span>
        </div>
        <div className="ml-auto">
          <span className="icon">
            <FaShoppingCart />
          </span>
        </div>
      </div>
    </Box>
  );
};

// Total Products Dashboard Box - Dynamic
const TotalProductsBox = () => {
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductCount = async () => {
      try {
        setLoading(true);
        const res = await fetchDataFromApi("/api/products/get/count");
        setProductCount(res?.productCount || 0);
      } catch (error) {
        console.error("Error fetching product count:", error);
        setProductCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProductCount();
  }, []);

  return (
    <Box
      className="dashboardBox"
      sx={{
        backgroundImage: `linear-gradient(to right, #2c78e5, #60aff5)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "16px",
        borderRadius: "4px",
        margin: "0 10px",
        minWidth: "250px",
      }}
    >
      <div className="d-flex w-100">
        <div className="col1">
          <h5 className="text-white">Total Products</h5>
          <span className="text-white">
            {loading ? "Loading..." : productCount.toLocaleString()}
          </span>
        </div>
        <div className="ml-auto">
          <span className="icon">
            <MdShoppingBag />
          </span>
        </div>
      </div>
    </Box>
  );
};

// Total Revenue Dashboard Box - Dynamic
const TotalRevenueBox = () => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalRevenue = async () => {
      try {
        setLoading(true);
        const res = await fetchDataFromApi("/api/orders/get/revenue");
        setTotalRevenue(res?.totalRevenue || 0);
      } catch (error) {
        console.error("Error fetching total revenue:", error);
        setTotalRevenue(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalRevenue();
  }, []);

  return (
    <Box
      className="dashboardBox"
      sx={{
        backgroundImage: `linear-gradient(to right, #ff6b35, #f7931e)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "16px",
        borderRadius: "4px",
        margin: "0 10px",
        minWidth: "250px",
      }}
    >
      <div className="d-flex w-100">
        <div className="col1">
          <h5 className="text-white">Total Revenue</h5>
          <span className="text-white">
            {loading ? "Loading..." : `₹${totalRevenue.toLocaleString()}`}
          </span>
        </div>
        <div className="ml-auto">
          <span className="icon">
            <MdShoppingBag />
          </span>
        </div>
      </div>
    </Box>
  );
};

// Main Dashboard Component using individual boxes
const Dashboard = () => {
  return (
    <div className="right-content w-100">
      {/* Dashboard Summary */}
      <div className="row dashbordBoxWrapper">
        <div className="col-md-12 d-flex">
          <TotalUsersBox />
          <TotalOrdersBox />
          <TotalProductsBox />
          <TotalRevenueBox />
        </div>
      </div>

      {/* Charts Section */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card shadow border-0 p-3">
            <h5 className="mb-3">Monthly Sales</h5>
            <Chart
              chartType="ColumnChart"
              width="100%"
              height="400px"
              data={barData}
              options={barOptions}
            />
          </div>
        </div>
        {/* <div className="col-md-6">
          <div className="card shadow border-0 p-3">
            <h5 className="mb-3">Activity Overview</h5>
            <Chart
              chartType="PieChart"
              width="100%"
              height="400px"
              data={pieData}
              options={pieOptions}
            />
          </div>
        </div> */}
      </div>
    </div>
  );
};

// Export individual components and main dashboard
export { TotalUsersBox, TotalOrdersBox, TotalProductsBox, TotalRevenueBox };
export default Dashboard;
