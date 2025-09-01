import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle, FaEye, FaShoppingCart } from "react-icons/fa";
import { MdShoppingBag, MdDelete } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";
import { FaPencil } from "react-icons/fa6";
import DashboardBox from "./../Deshbord/dashbordBox";
import { Chart } from "react-google-charts";
import {
  Button,
  Menu,
  MenuItem,
  Pagination,
  Select,
  FormControl,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import { Mycontext } from "../../../App";
import { fetchDataFromApi, deleteData } from "../../../utils/api";

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
};

const Deshbord = () => {
  const context = useContext(Mycontext);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const ITEM_HEIGHT = 48;

  const [productList, setProductList] = useState([]);
  const [perPage, setPerPage] = useState(8);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleDelete = async (id) => {
    await deleteData(`/api/products/${id}`);
    context.setAlertBox({
      open: true,
      error: false,
      msg: "Product Deleted!",
    });
    fetchProducts();
  };

  const fetchProducts = async () => {
    context.setProgress(40);
    const query = `page=${page}&perPage=${perPage}`;

    const res = await fetchDataFromApi(`/api/products?${query}`);
    const countRes = await fetchDataFromApi("/api/products/get/count");

    const items = res?.products || [];
    setProductList(items);
    setTotalCount(countRes?.productCount || items.length);
    context.setProgress(100);
  };

  useEffect(() => {
    context.setisHideSliderAndHeader(false);
    window.scrollTo(0, 0);
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, perPage]);

  return (
    <div className="right-content w-100">
      {/* Dashboard Summary */}
      <div className="row dashbordBoxWrapper">
        <div className="table-responsive mt-3">
          <table className="table table-bordered v-align">
            <thead className="thead-dark">
              <tr>
                <th>UID</th>
                <th style={{ width: 310 }}>Product</th>
                <th>Category</th>
                <th>SubCategory</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {productList.map((p, i) => (
                <tr key={p._id}>
                  <td>{(page - 1) * perPage + i + 1}</td>
                  <td>
                    <div className="d-flex align-items-center prdocutbox">
                      <div className="imgWrapper">
                        <img
                          src={p.images?.[0] || "/fallback.png"}
                          alt={p.name}
                          className="w-100 myemoji"
                        />
                      </div>
                      <div className="info pl-0">
                        <h6>{p.name}</h6>

                        <p>{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td>{p.category?.name || "N/A"}</td>
                  <td>{p.subCat || "-"}</td>
                  <td>{p.brand}</td>
                  <td>
                    {p.oldPrice && <del className="old">₹{p.oldPrice}</del>}
                    <span className="new text-danger"> ₹{p.price}</span>
                  </td>
                  <td>{p.countInStock}</td>
                  <td>{p.rating || "-"} ⭐</td>
                  <td>
                    <div className="actions d-flex align-items-center">
                      <Link to={`/products/detail/${p._id}`}>
                        <Button color="secondary">
                          <FaEye />
                        </Button>
                      </Link>
                      <Link to={`/products/edit/${p._id}`}>
                        <Button className="success">
                          <FaPencil />
                        </Button>
                      </Link>
                      <Button
                        className="error"
                        onClick={() => handleDelete(p._id)}
                      >
                        <MdDelete />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-between align-items-center mt-2">
            <p>
              Showing {productList.length} of {totalCount} products
            </p>
            <Pagination
              count={Math.ceil(totalCount / perPage)}
              page={page}
              onChange={(e, val) => setPage(val)}
              showFirstButton
              showLastButton
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deshbord;
