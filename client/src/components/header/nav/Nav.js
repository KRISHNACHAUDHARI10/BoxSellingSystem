import React, { useContext, useState } from "react";
import "./nav.css";
import Button from "@mui/material/Button";
import { ChevronDown, LayoutGrid, Headset } from "lucide-react";
import { Link } from "react-router-dom";
import { MyContext } from "../../../App";
import Megamnu from "../../../assets/images/Megamnu.jpg";
import ClickAwayListener from "@mui/material/ClickAwayListener";

const Nav = () => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const { categories, loadingCategories } = useContext(MyContext);

  // Category dropdown rendering
  const renderCategories = () => {
    if (loadingCategories) {
      return (
        <div className="dropdown_menu categoryMenu">
          <p>Loading categories...</p>
        </div>
      );
    }

    if (!categories || categories.length === 0) {
      return (
        <div className="dropdown_menu categoryMenu">
          <p>No categories available</p>
        </div>
      );
    }

    const chunkSize = Math.ceil(categories.length / 3);
    const columns = [
      categories.slice(0, chunkSize),
      categories.slice(chunkSize, chunkSize * 2),
      categories.slice(chunkSize * 2),
    ];

    return (
      <div className="dropdown_menu categoryMenu">
        <div className="row">
          {columns.map((group, idx) => (
            <div className="col" key={idx}>
              <h6 className="text-g">
                {["Categories", "More Categories", "Popular"][idx]}
              </h6>
              <ul className="mt-3 mb-0">
                {group.map((category) => (
                  <li key={category._id || category.id}>
                    <Link to={`/category/${category._id || category.id}`}>
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Optional image column */}
          <div className="col">
            <img src={Megamnu} alt="Category Visual" className="mega-img" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="nav d-flex align-items-center">
      <div className="container-fluid">
        <div className="row position-relative">
          {/* Left section with Browse All Categories */}
          <div className="col-sm-3 part1">
            <ClickAwayListener
              onClickAway={() => setIsCategoryDropdownOpen(false)}
            >
              <div>
                <Button
                  className="bg-g text-white catTab"
                  onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                >
                  <LayoutGrid className="me-2" />
                  Browse All Categories
                  <ChevronDown className="ms-2" />
                </Button>
                {isCategoryDropdownOpen && renderCategories()}
              </div>
            </ClickAwayListener>
          </div>

          {/* Middle section with main nav */}
          <div className="col-sm-7 part2 position-static">
            <nav>
              <ul className="list list-inline mb-0">
                <li className="list-inline-item">
                  <Link to="/" className="nav-link">
                    Home
                  </Link>
                </li>
                <li className="list-inline-item">
                  <Link to="/about" className="nav-link">
                    About
                  </Link>
                </li>
                <li className="list-inline-item">
                  <Link to="/listing" className="nav-link">
                    Shop
                  </Link>
                </li> 
                <li className="list-inline-item">
                  <Link to="/blog" className="nav-link">
                    Blog
                  </Link>
                </li>
                <li className="list-inline-item">
                  <Link to="/contacts" className="nav-link">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Right section - support */}
          <div className="col-sm-2 part3 d-flex align-items-center">
            <div className="phno d-flex align-items-center ms-auto">
              <Headset className="me-2" />
              <div className="info">
                <h5 className="text-g mb-0">1900 - 888</h5>
                <p className="mb-0">24/7 Support center</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nav;
