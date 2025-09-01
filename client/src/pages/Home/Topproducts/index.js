import React from "react";
import "./style.css";
import sw3 from "../../../assets/images/sw3.jpg";
import sw5 from "../../../assets/images/sw5.jpg";
import sw6 from "../../../assets/images/sw6.jpg";
import { Link } from "react-router-dom";
import Rating from "@mui/material/Rating";

const TopProducts = (props) => {
  return (
    <>
      <div className="topsellingbox">
        <h4>{props.title}</h4>
        <div className="items d-flex align-items-center">
          <div className="img">
            <Link to="">
              <img src={sw3} className="w-100" />
            </Link>
          </div>

          <div className="info px-3">
            <Link to="">
              <h6>Nestle Original Coffe-Mate Coffee Creamer</h6>
            </Link>
            <Rating
              name="half-rating-read"
              defaultValue={3.5}
              precision={0.5}
              readOnly
            />
            <div className="d-flex align-items-center">
              <span className="price text-g font-weight-bold">₹30.50</span>
              <span className="oldPrice">₹30.20</span>
            </div>
          </div>
        </div>
        <div className="items d-flex align-items-center">
          <div className="img">
            <Link to="">
              <img src={sw3} className="w-100" />
            </Link>
          </div>

          <div className="info px-3">
            <Link to="">
              <h6>Nestle Original Coffe-Mate Coffee Creamer</h6>
            </Link>
            <Rating
              name="half-rating-read"
              defaultValue={3.5}
              precision={0.5}
              readOnly
            />
            <div className="d-flex align-items-center">
              <span className="price text-g font-weight-bold">₹30.50</span>
              <span className="oldPrice">₹30.20</span>
            </div>
          </div>
        </div>
        <div className="items d-flex align-items-center">
          <div className="img">
            <Link to="">
              <img src={sw3} className="w-100" />
            </Link>
          </div>

          <div className="info px-3">
            <Link to="">
              <h6>Nestle Original Coffe-Mate Coffee Creamer</h6>
            </Link>
            <Rating
              name="half-rating-read"
              defaultValue={3.5}
              precision={0.5}
              readOnly
            />
            <div className="d-flex align-items-center">
              <span className="price text-g font-weight-bold">₹30.50</span>
              <span className="oldPrice">₹30.20</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopProducts;
