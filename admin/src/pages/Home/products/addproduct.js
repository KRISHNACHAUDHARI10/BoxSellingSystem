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
  deleteData,
  deleteImages,
  fetchDataFromApi,
  uploadImage,
  postData,
} from "../../../utils/api";

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

const ProductUpload = () => {
  const context = useContext(Mycontext);
  console.log("1. Initial Context Data:", context.catData);
  console.log("2. Context catData structure:", context.catData);

  const [categoryvalue, setcategoryvalue] = useState("");
  const [ratingValue, setratingValue] = useState(1);
  const [subCatData, setSubCatData] = useState([]);
  const [selectedProductWeights, setSelectedProductWeights] = useState([]);
  const [selectedProductWeight, setSelectedProductWeight] = useState("");
  const [productWEIGHTData, setProductWEIGHTData] = useState([]);
  const [isFeaturedValue, setisFeaturedValue] = useState(false);

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

  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);

  // --- Handlers for form fields ---
  const inputchange = (e) => {
    setFormFields((prevFormFields) => ({
      ...prevFormFields,
      [e.target.name]: e.target.value,
    }));
  };

  // FIXED: Updated category handler to work with new data structure
  const handleChangeCategory = (event) => {
    const selectedCatId = event.target.value;

    // FIXED: Use context.catData directly since it's now an array
    const selectedCategory = Array.isArray(context.catData)
      ? context.catData.find((cat) => cat._id === selectedCatId)
      : null;

    console.log("Selected Category ID:", selectedCatId);
    console.log("Selected Category Object:", selectedCategory);
    console.log("Category Children:", selectedCategory?.children);

    // Update the dropdown's controlling state
    setcategoryvalue(selectedCatId);

    // Update form fields
    setFormFields((prev) => ({
      ...prev,
      catId: selectedCatId,
      catName: selectedCategory ? selectedCategory.name : "",
      subCatId: "", // Reset subcategory
      subCat: "", // Reset subcategory name
    }));

    // Set subcategory data immediately
    if (selectedCategory && selectedCategory.children) {
      console.log("Setting subCatData:", selectedCategory.children);
      setSubCatData(selectedCategory.children);
    } else {
      console.log("No children found, clearing subCatData");
      setSubCatData([]);
    }
  };

  // Fixed subcategory handler
  const handleChangeSubCategory = (event) => {
    const selectedSubCatId = event.target.value;

    console.log("Selected SubCategory ID:", selectedSubCatId);
    console.log("Current subCatData:", subCatData);

    // Find the selected subcategory from the current subCatData
    const selectedSubCategory = subCatData.find(
      (sub) => sub._id === selectedSubCatId
    );

    console.log("Selected SubCategory Object:", selectedSubCategory);

    if (selectedSubCategory) {
      setFormFields((prev) => ({
        ...prev,
        subCat: selectedSubCategory.name,
        subCatId: selectedSubCatId,
      }));
    } else {
      setFormFields((prev) => ({
        ...prev,
        subCat: "",
        subCatId: "",
      }));
    }
  };

  const handleChangeisFeturedValue = (event) => {
    const value = event.target.value;
    setisFeaturedValue(value);
    setFormFields((prevFormFields) => ({
      ...prevFormFields,
      isFeatured: value,
    }));
  };

  const handleChangeProductWeight = (event) => {
    const selectedWeight = event.target.value;
    setSelectedProductWeight(selectedWeight);
    setFormFields((prevFormFields) => ({
      ...prevFormFields,
      productWeight: selectedWeight, // Fixed: should be selectedWeight, not []
    }));
  };

  const handleChangeLocation = (event) => {
    setFormFields((prevFormFields) => ({
      ...prevFormFields,
      location: event.target.value,
    }));
  };

  // --- Data Fetching Effects ---

  // Effect to fetch product weights on component mount
  useEffect(() => {
    window.scrollTo(0, 0);

    // Initial image cleanup logic
    fetchDataFromApi("/api/imageUpload")
      .then((res) => {
        res?.forEach((item) => {
          item?.images?.forEach((img) => {
            deleteImages(`/api/category/deleteImage?img=${img}`).then(() => {
              // deleteData("/api/imageUpload/deleteAllImages");
            });
          });
        });
      })
      .catch((error) =>
        console.error("Error during initial image cleanup:", error)
      );

    const fetchProductWeightOptions = async () => {
      try {
        const res = await fetchDataFromApi("/api/productWeight");
        setProductWEIGHTData(res);
      } catch (error) {
        console.error("Error fetching product weight options:", error);
        context.setAlertBox({
          open: true,
          error: true,
          msg: `Failed to load product weight options: ${
            error.message || "Network error"
          }`,
        });
      }
    };
    fetchProductWeightOptions();
  }, []);

  // --- Image Upload and Management ---
  const onChageFile = async (e, apiEndPoint) => {
    const files = e.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (
        !file ||
        !(
          file.type === "image/jpeg" ||
          file.type === "image/jpg" ||
          file.type === "image/png" ||
          file.type === "image/webp"
        )
      ) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Please select valid JPG, PNG, or WebP image files.",
        });
        return;
      }
    }

    const currentFormData = new FormData();
    for (let i = 0; i < files.length; i++) {
      currentFormData.append("images", files[i]);
    }

    try {
      setUploading(true);
      const uploadResult = await uploadImage(apiEndPoint, currentFormData);

      if (uploadResult?.images?.length > 0) {
        setPreviews((prev) => [...prev, ...uploadResult.images]);
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Images uploaded successfully!",
        });
      } else {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Images uploaded, but no new image URLs were received from the server.",
        });
      }
    } catch (error) {
      console.error("Error in onChageFile:", error);
      context.setAlertBox({
        open: true,
        error: true,
        msg:
          "Image upload failed. " +
          (error.response?.data?.error || error.message || "Unknown error."),
      });
    } finally {
      setUploading(false);
    }
  };

  // Update formFields.images whenever previews change
  useEffect(() => {
    setFormFields((prev) => ({
      ...prev,
      images: previews,
    }));
  }, [previews]);

  const removeImg = async (imgUrl) => {
    try {
      await deleteImages(`/api/imageUpload/deleteImage?img=${imgUrl}`);

      const updatedPreview = previews.filter((img) => img !== imgUrl);
      setPreviews(updatedPreview);
      context.setAlertBox({
        open: true,
        error: false,
        msg: "Image Deleted!",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      context.setAlertBox({
        open: true,
        error: true,
        msg:
          "Failed to delete image. " +
          (error.response?.data?.error || error.message || "Unknown error."),
      });
    }
  };

  // --- Product Submission ---
  const addproduct = async (e) => {
    e.preventDefault();

    // Frontend Validation
    if (formFields.name.trim() === "") {
      context.setAlertBox({
        open: true,
        msg: "Please add a product name",
        error: true,
      });
      return false;
    }
    if (formFields.description.trim() === "") {
      context.setAlertBox({
        open: true,
        msg: "Please add a product description",
        error: true,
      });
      return false;
    }
    if (formFields.brand.trim() === "") {
      context.setAlertBox({
        open: true,
        msg: "Please add a product brand",
        error: true,
      });
      return false;
    }

    const parsedPrice = parseFloat(formFields.price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      context.setAlertBox({
        open: true,
        msg: "Please enter a valid positive product price",
        error: true,
      });
      return false;
    }

    const parsedOldPrice = formFields.oldPrice
      ? parseFloat(formFields.oldPrice)
      : null;
    if (
      formFields.oldPrice !== "" &&
      (isNaN(parsedOldPrice) || parsedOldPrice < 0)
    ) {
      context.setAlertBox({
        open: true,
        msg: "Please enter a valid non-negative old price or leave empty",
        error: true,
      });
      return false;
    }

    if (!formFields.catId) {
      context.setAlertBox({
        open: true,
        msg: "Please select a product category",
        error: true,
      });
      return false;
    }

    if (subCatData.length > 0 && !formFields.subCatId) {
      context.setAlertBox({
        open: true,
        msg: "Please select a product subcategory",
        error: true,
      });
      return false;
    }

    const parsedCountInStock = parseInt(formFields.countInStock);
    if (isNaN(parsedCountInStock) || parsedCountInStock < 0) {
      context.setAlertBox({
        open: true,
        msg: "Please enter a valid non-negative product stock quantity",
        error: true,
      });
      return false;
    }

    if (ratingValue < 1 || ratingValue > 5) {
      context.setAlertBox({
        open: true,
        msg: "Please select a product rating between 1 and 5",
        error: true,
      });
      return false;
    }

    const parsedDiscount = parseInt(formFields.discount);
    if (isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
      context.setAlertBox({
        open: true,
        msg: "Please enter a valid discount percentage (0-100)",
        error: true,
      });
      return false;
    }

    if (!formFields.productWeight) {
      context.setAlertBox({
        open: true,
        msg: "Please select a product weight",
        error: true,
      });
      return false;
    }

    if (previews.length === 0) {
      context.setAlertBox({
        open: true,
        msg: "Please upload at least one product image",
        error: true,
      });
      return false;
    }

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

      console.log("Payload being sent:", payload);

      const res = await postData("/api/products/create", payload);

      if (res) {
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Product published successfully!",
        });
        // Reset form if needed
      }
    } catch (error) {
      console.error("Error publishing product:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to publish product. Please check the fields and try again.";

      context.setAlertBox({
        open: true,
        error: true,
        msg: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="right-content w-100">
        {/* Breadcrumb Header */}
        <div className="card shadow mybreadcrumb border-0 w-100 flex-row p-4 align-items-center justify-content-between">
          <h5 className="mb-0">Product Upload</h5>
          <div role="presentation">
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
                label="Upload"
                deleteIcon={<ExpandMoreIcon />}
                onDelete={() => {}}
              />
            </Breadcrumbs>
          </div>
        </div>

        {/* Form */}
        <form className="form" onSubmit={addproduct}>
          <div className="row">
            <div className="col-sm-11">
              <div className="card p-4">
                <h5 className="text-white">Basic Information</h5>

                <div className="form-group">
                  <h6>Product Name</h6>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    onChange={inputchange}
                    value={formFields.name}
                  />
                </div>

                <div className="form-group mt-3">
                  <h6>Description</h6>
                  <textarea
                    rows={5}
                    cols={10}
                    className="form-control"
                    name="description"
                    onChange={inputchange}
                    value={formFields.description}
                  ></textarea>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <h6>Category</h6>
                      <Select
                        value={categoryvalue}
                        displayEmpty
                        onChange={handleChangeCategory}
                        className="w-100"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {/* FIXED: Use context.catData directly instead of context.catData.categoryList */}
                        {Array.isArray(context.catData) &&
                        context.catData.length > 0 ? (
                          context.catData.map((cat) => (
                            <MenuItem
                              className="text-capitalize"
                              value={cat._id}
                              key={cat._id}
                            >
                              {cat.name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="" disabled>
                            {context.progress > 0 && context.progress < 100
                              ? "Loading categories..."
                              : "No categories available"}
                          </MenuItem>
                        )}
                      </Select>
                    </div>
                  </div>

                  <div className="col">
                    <div className="form-group">
                      <h6>Sub Category</h6>
                      <Select
                        value={formFields.subCatId}
                        displayEmpty
                        onChange={handleChangeSubCategory}
                        className="w-100"
                        disabled={!categoryvalue || subCatData.length === 0}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {subCatData?.length > 0 ? (
                          subCatData.map((subCat) => (
                            <MenuItem
                              className="text-capitalize"
                              value={subCat._id}
                              key={subCat._id}
                            >
                              {subCat.name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem value="" disabled>
                            No subcategories available
                          </MenuItem>
                        )}
                      </Select>
                    </div>
                  </div>

                  <div className="col">
                    <div className="form-group">
                      <h6>Brand</h6>
                      <input
                        type="text"
                        className="form-control"
                        name="brand"
                        onChange={inputchange}
                        value={formFields.brand}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <h6>Price</h6>
                      <input
                        type="number"
                        className="form-control"
                        name="price"
                        onChange={inputchange}
                        value={formFields.price}
                      />
                    </div>
                  </div>

                  <div className="col">
                    <div className="form-group">
                      <h6>Old Price</h6>
                      <input
                        type="number"
                        className="form-control"
                        name="oldPrice"
                        onChange={inputchange}
                        value={formFields.oldPrice}
                      />
                    </div>
                  </div>

                  <div className="col">
                    <div className="form-group">
                      <h6>Product Stocks</h6>
                      <input
                        type="number"
                        className="form-control"
                        name="countInStock"
                        value={formFields.countInStock || ""}
                        onChange={inputchange}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <h6>Is Featured</h6>
                      <Select
                        name="isFeatured"
                        value={formFields.isFeatured}
                        onChange={inputchange}
                        className="w-100"
                      >
                        <MenuItem value={true}>True</MenuItem>
                        <MenuItem value={false}>False</MenuItem>
                      </Select>
                    </div>
                  </div>

                  <div className="col">
                    <div className="form-group">
                      <h6>Discount</h6>
                      <input
                        type="number"
                        className="form-control"
                        name="discount"
                        value={formFields.discount || ""}
                        onChange={inputchange}
                      />
                    </div>
                  </div>

                  {/* Product Weight Select Dropdown */}
                  <div className="col">
                    <div className="form-group">
                      <h6>Product Weight</h6>
                      <Select
                        multiple
                        value={selectedProductWeights}
                        onChange={(e) => {
                          const values = e.target.value;
                          setSelectedProductWeights(values);
                          setFormFields((prev) => ({
                            ...prev,
                            productWeight: values, // store as array
                          }));
                        }}
                        renderValue={(selected) => selected.join(", ")} // shows "500g, 1kg"
                        className="w-100"
                        disabled={
                          !productWEIGHTData || productWEIGHTData.length === 0
                        }
                      >
                        {productWEIGHTData.map((item) => (
                          <MenuItem key={item._id} value={item.productWeight}>
                            {item.productWeight}
                          </MenuItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <h6>Ratings</h6>
                      <Rating
                        name="rating"
                        value={ratingValue}
                        onChange={(event, newValue) => {
                          setratingValue(newValue);
                          setFormFields((prevFormFields) => ({
                            ...prevFormFields,
                            rating: newValue,
                          }));
                        }}
                      />
                    </div>
                  </div>

                  <div className="col">
                    <div className="form-group">
                      <h6>Location</h6>
                      <Select
                        value={formFields.location}
                        onChange={handleChangeLocation}
                        displayEmpty
                        className="w-100"
                      >
                        <MenuItem value="All">
                          <em>All</em>
                        </MenuItem>
                        {context.countryData?.length > 0 ? (
                          context.countryData
                            .sort((a, b) =>
                              a.name.common.localeCompare(b.name.common)
                            )
                            .map((country) => (
                              <MenuItem
                                value={country.name.common}
                                key={country.name.common}
                                className="text-capitalize"
                              >
                                {country.name.common}
                              </MenuItem>
                            ))
                        ) : (
                          <MenuItem value="" disabled>
                            {context.progress > 0 && context.progress < 100
                              ? "Loading countries..."
                              : "No countries available"}
                          </MenuItem>
                        )}
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Section */}
              <div className="subclassofdetail">
                <div className="imgUploadSec d-flex align-items-center gap-3 flex-wrap">
                  {previews.length > 0 &&
                    previews.map((img) => (
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
                            className="w-100"
                            src={img}
                            effect="blur"
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
                          id="categoryImageInput"
                          name="images"
                          multiple
                          hidden
                          onChange={(e) =>
                            onChageFile(e, "/api/imageUpload/upload")
                          }
                        />
                        <div
                          className="info text-center"
                          onClick={() =>
                            document
                              .getElementById("categoryImageInput")
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
                  disabled={uploading || isLoading} // Disable if uploading images or submitting form
                  className="btn-blue btn-lg btn-big w-100"
                >
                  <FaCloudUploadAlt />
                  &nbsp;{" "}
                  {isLoading ? (
                    <CircularProgress color="inherit" className="loder" />
                  ) : (
                    "PUBLISH AND VIEW"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProductUpload;
