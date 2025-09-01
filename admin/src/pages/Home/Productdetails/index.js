import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchDataFromApi } from "../../../utils/api";
import Slider from "react-slick";
import Rating from "@mui/material/Rating";
import { MdBrandingWatermark } from "react-icons/md";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { IoMdResize, IoIosPricetags } from "react-icons/io";
import { MdOutlineRateReview } from "react-icons/md";
import { GrValidate } from "react-icons/gr";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  const ProductSliderBig = useRef();
  const ProductSliderSmall = useRef();

  const goToSlide = (index) => {
    ProductSliderBig.current.slickGoTo(index);
    ProductSliderSmall.current.slickGoTo(index);
  };

  useEffect(() => {
    const getProduct = async () => {
      try {
        const data = await fetchDataFromApi(`/api/products/${id}`);

        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product", err);
      }
    };
    getProduct();
  }, [id]);

  if (!product) return <p>Loading...</p>;

  const bigSliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };
  const smallSliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    beforeChange: (prev, next) => goToSlide(next),
  };

  return (
    <div className="product-details">
      <h4>{product.name}</h4>
      <div className="row">
        {/* Left: Image Slider */}
        <div className="col-md-5">
          <Slider {...bigSliderSettings} ref={ProductSliderBig}>
            {product.images.map((img, idx) => (
              <div key={idx}>
                <img src={img} alt={`Product ${idx}`} className="w-100" />
              </div>
            ))}
          </Slider>
          <Slider {...smallSliderSettings} ref={ProductSliderSmall}>
            {product.images.map((img, idx) => (
              <div key={idx} onClick={() => goToSlide(idx)}>
                <img src={img} alt={`Thumbnail ${idx}`} className="w-100" />
              </div>
            ))}
          </Slider>
        </div>

        {/* Right: Product Info */}
        <div className="col-md-7">
          <p>
            <MdBrandingWatermark /> <strong>Brand:</strong> {product.brand}
          </p>
          <p>
            <BiSolidCategoryAlt /> <strong>Category:</strong> {product.catName}
          </p>
          <p>
            <BiSolidCategoryAlt /> <strong>Subcategory:</strong>{" "}
            {product.subCat}
          </p>
          <p>
            <IoIosPricetags /> <strong>Price:</strong> ₹{product.price}{" "}
            <span style={{ textDecoration: "line-through", color: "gray" }}>
              ₹{product.oldPrice}
            </span>
          </p>
          <p>
            <MdOutlineRateReview /> <strong>Rating:</strong>{" "}
            <Rating value={product.rating} precision={0.5} readOnly />
          </p>
          <p>
            <GrValidate /> <strong>Discount:</strong> {product.discount}%
          </p>
          <p>
            <IoMdResize /> <strong>Weight:</strong>{" "}
            {product.productWeight?.join(", ")}
          </p>
          <p>
            <strong>Location:</strong> {product.location}
          </p>
          <p>
            <strong>Stock:</strong> {product.countInStock}
          </p>
          <p>
            <strong>Description:</strong> {product.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
