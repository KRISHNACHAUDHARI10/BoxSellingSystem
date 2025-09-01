import React, { useContext, useEffect, useState } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { emphasize, styled } from "@mui/material/styles";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Rating from "@mui/material/Rating";
import { FaRegImages, FaCloudUploadAlt } from "react-icons/fa";
import MenuItem from "@mui/material/MenuItem";
import { IoCloseSharp } from "react-icons/io5";
import CircularProgress from "@mui/material/CircularProgress";
import Select from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";

import { Mycontext } from "../../../App";
import {
  fetchDataFromApi,
  uploadImage,
  deleteImages,
  putData,
} from "../../../utils/api";
import { useParams, useNavigate } from "react-router-dom";

const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.grey[800]
      : theme.palette.grey[100],
  height: theme.spacing(3),
  color: theme.palette.text.primary,
  fontWeight: theme.typography.fontWeightRegular,
  "&:hover, &:focus": {
    backgroundColor: emphasize(
      theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[100],
      0.06
    ),
  },
  "&:active": {
    boxShadow: theme.shadows[1],
    backgroundColor: emphasize(
      theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[100],
      0.12
    ),
  },
}));

const EditProduct = () => {
  const context = useContext(Mycontext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [formFields, setFormFields] = useState({
    name: "",
    description: "",
    images: [],
    brand: "",
    price: "",
    oldPrice: "",
    catName: "",
    catId: "",
    subCatId: "",
    subCat: "",
    category: "",
    countInStock: "",
    rating: 0,
    isFeatured: false,
    discount: 0,
    productWeight: "",
    location: "All",
  });

  const [categoryvalue, setCategoryValue] = useState("");
  const [subCatData, setSubCatData] = useState([]);
  const [productWEIGHTData, setProductWEIGHTData] = useState([]);
  const [selectedProductWeight, setSelectedProductWeight] = useState("");
  const [ratingValue, setRatingValue] = useState(1);
  const [previews, setPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch product by ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetchDataFromApi(`/api/products/${id}`);
        if (res) {
          setFormFields({
            ...res,
            price: res.price || "",
            oldPrice: res.oldPrice || "",
            countInStock: res.countInStock || "",
            discount: res.discount || 0,
            rating: res.rating || 1,
          });
          setCategoryValue(res.catId || "");
          setSelectedProductWeight(res.productWeight || "");
          setRatingValue(res.rating || 1);
          setPreviews(res.images || []);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Failed to fetch product details.",
        });
      }
    };
    fetchProduct();
  }, [id, context]);

  // Fetch product weights
  useEffect(() => {
    const fetchWeights = async () => {
      try {
        const res = await fetchDataFromApi("/api/productWeight");
        setProductWEIGHTData(res);
      } catch (error) {
        console.error("Error fetching product weights:", error);
      }
    };
    fetchWeights();
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (!categoryvalue || !context.catData?.categoryList?.length) {
      setSubCatData([]);
      return;
    }
    const selectedCategory = context.catData.categoryList.find(
      (cat) => cat._id === categoryvalue
    );
    setSubCatData(selectedCategory?.children || []);
  }, [categoryvalue, context.catData]);

  const inputChange = (e) => {
    const value =
      e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setFormFields((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const handleChangeCategory = (e) => {
    const selectedCatId = e.target.value;
    setCategoryValue(selectedCatId);
    const selectedCategory = context.catData.categoryList.find(
      (cat) => cat._id === selectedCatId
    );
    setFormFields((prev) => ({
      ...prev,
      catId: selectedCatId,
      catName: selectedCategory ? selectedCategory.name : "",
      subCatId: "",
      subCat: "",
    }));
  };

  const handleChangeSubCategory = (e) => {
    const selectedSubCatId = e.target.value;
    const selectedSub = subCatData.find((sub) => sub._id === selectedSubCatId);
    setFormFields((prev) => ({
      ...prev,
      subCat: selectedSub ? selectedSub.name : "",
      subCatId: selectedSubCatId,
    }));
  };

  const handleChangeProductWeight = (e) => {
    setSelectedProductWeight(e.target.value);
    setFormFields((prev) => ({
      ...prev,
      productWeight: e.target.value,
    }));
  };

  const handleChangeLocation = (e) => {
    setFormFields((prev) => ({
      ...prev,
      location: e.target.value,
    }));
  };

  const onChangeFile = async (e) => {
    const files = e.target.files;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append("images", files[i]);
    try {
      setUploading(true);
      const uploadRes = await uploadImage("/api/imageUpload/upload", formData);
      if (uploadRes?.images?.length > 0) {
        setPreviews((prev) => [...prev, ...uploadRes.images]);
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Images uploaded successfully!",
        });
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Failed to upload images.",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImg = async (imgUrl) => {
    try {
      await deleteImages(`/api/imageUpload/deleteImage?img=${imgUrl}`);
      setPreviews(previews.filter((img) => img !== imgUrl));
      context.setAlertBox({ open: true, error: false, msg: "Image deleted!" });
    } catch (error) {
      console.error("Error deleting image:", error);
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Failed to delete image.",
      });
    }
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        ...formFields,
        images: previews,
        price: parseFloat(formFields.price),
        oldPrice: formFields.oldPrice ? parseFloat(formFields.oldPrice) : null,
        countInStock: parseInt(formFields.countInStock),
        discount: parseInt(formFields.discount),
        rating: ratingValue,
      };

      const res = await putData(`/api/products/${id}`, payload);

      if (res.status) {
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Product updated successfully!",
        });
        navigate("/admin/products");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      context.setAlertBox({
        open: true,
        error: true,
        msg:
          error.response?.data?.message ||
          "Failed to update product. Please check the fields.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow mybreadcrumb border-0 w-100 flex-row p-4 align-items-center justify-content-between">
        <h5 className="mb-0">Edit Product</h5>
        <Breadcrumbs aria-label="breadcrumb">
          <StyledBreadcrumb
            component="a"
            href="#"
            label="Dashboard"
            icon={<HomeIcon fontSize="small" />}
          />
          <StyledBreadcrumb
            label="Products"
            component="a"
            href="#"
            deleteIcon={<ExpandMoreIcon />}
            onDelete={() => {}}
          />
          <StyledBreadcrumb
            label="Edit"
            deleteIcon={<ExpandMoreIcon />}
            onDelete={() => {}}
          />
        </Breadcrumbs>
      </div>

      <form className="form" onSubmit={updateProduct}>
        <div className="row">
          <div className="col-sm-11">
            <div className="card p-4">
              <h5 className="text-white">Product Information</h5>

              <div className="form-group mt-3">
                <h6>Product Name</h6>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  onChange={inputChange}
                  value={formFields.name || ""}
                />
              </div>

              <div className="form-group mt-3">
                <h6>Description</h6>
                <textarea
                  rows={5}
                  className="form-control"
                  name="description"
                  onChange={inputChange}
                  value={formFields.description || ""}
                ></textarea>
              </div>

              <div className="row mt-3">
                <div className="col">
                  <h6>Category</h6>
                  <Select
                    value={categoryvalue || ""}
                    onChange={handleChangeCategory}
                    className="w-100"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {context.catData?.categoryList?.map((cat) => (
                      <MenuItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
                <div className="col">
                  <h6>Sub Category</h6>
                  <Select
                    value={formFields.subCatId || ""}
                    onChange={handleChangeSubCategory}
                    className="w-100"
                    disabled={!categoryvalue || subCatData.length === 0}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {subCatData.map((sub) => (
                      <MenuItem key={sub._id} value={sub._id}>
                        {sub.name}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Price, Old Price, Discount */}
              <div className="row mt-3">
                <div className="col">
                  <h6>Price</h6>
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    onChange={inputChange}
                    value={formFields.price || ""}
                  />
                </div>
                <div className="col">
                  <h6>Old Price</h6>
                  <input
                    type="number"
                    className="form-control"
                    name="oldPrice"
                    onChange={inputChange}
                    value={formFields.oldPrice || ""}
                  />
                </div>
                <div className="col">
                  <h6>Discount</h6>
                  <input
                    type="number"
                    className="form-control"
                    name="discount"
                    onChange={inputChange}
                    value={formFields.discount || 0}
                  />
                </div>
              </div>

              {/* Stock, Brand, Featured */}
              <div className="row mt-3">
                <div className="col">
                  <h6>Stock Quantity</h6>
                  <input
                    type="number"
                    className="form-control"
                    name="countInStock"
                    onChange={inputChange}
                    value={formFields.countInStock || ""}
                  />
                </div>
                <div className="col">
                  <h6>Brand</h6>
                  <input
                    type="text"
                    className="form-control"
                    name="brand"
                    onChange={inputChange}
                    value={formFields.brand || ""}
                  />
                </div>
                <div className="col">
                  <h6>Is Featured</h6>
                  <Select
                    name="isFeatured"
                    value={formFields.isFeatured || false}
                    onChange={inputChange}
                    className="w-100"
                  >
                    <MenuItem value={true}>True</MenuItem>
                    <MenuItem value={false}>False</MenuItem>
                  </Select>
                </div>
              </div>

              {/* Weight and Rating */}
              <div className="row mt-3">
                <div className="col">
                  <h6>Product Weight</h6>
                  <Select
                    value={selectedProductWeight || ""}
                    onChange={handleChangeProductWeight}
                    className="w-100"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {productWEIGHTData.map((item) => (
                      <MenuItem key={item._id} value={item.productWeight}>
                        {item.productWeight}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
                <div className="col">
                  <h6>Rating</h6>
                  <Rating
                    value={ratingValue || 1}
                    onChange={(e, newValue) => {
                      setRatingValue(newValue);
                      setFormFields((prev) => ({ ...prev, rating: newValue }));
                    }}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="subclassofdetail mt-4">
                <div className="imgUploadSec d-flex align-items-center gap-3 flex-wrap">
                  {previews.map((img) => (
                    <div className="uploadBox position-relative" key={img}>
                      <span
                        className="remove position-absolute"
                        onClick={() => removeImg(img)}
                      >
                        <IoCloseSharp />
                      </span>
                      <div className="box border rounded overflow-hidden">
                        <LazyLoadImage
                          alt={img}
                          src={img}
                          effect="blur"
                          className="w-100"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="uploadBox cursor-pointer">
                    {uploading ? (
                      <div className="progressBar text-center d-flex align-items-center justify-content-center flex-column">
                        <CircularProgress />
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          id="editProductImageInput"
                          multiple
                          hidden
                          onChange={onChangeFile}
                        />
                        <div
                          className="info text-center"
                          onClick={() =>
                            document
                              .getElementById("editProductImageInput")
                              .click()
                          }
                        >
                          <FaRegImages size={24} />
                          <h6 className="mt-2 mb-0">Upload Image</h6>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <br />
                <Button
                  type="submit"
                  disabled={uploading || isLoading}
                  className="btn-blue btn-lg btn-big w-100"
                >
                  <FaCloudUploadAlt />
                  &nbsp;
                  {isLoading ? (
                    <CircularProgress color="inherit" className="loder" />
                  ) : (
                    "UPDATE PRODUCT"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
