import React, { useContext, useEffect, useRef, useState } from "react";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// LazyLoadImage is not used in this component, you can remove this import if not needed
// import { LazyLoadImage } from "react-lazy-load-image-component";
import Button from "@mui/material/Button";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Mycontext } from "../../../App";
import {
  deleteData,
  fetchDataFromApi,
  postData,
  putData,
} from "../../../utils/api";
import CircularProgress from "@mui/material/CircularProgress";

// Styled Breadcrumb component (no changes needed here)
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

const AddProductWeight = () => {
  const [editId, setEditId] = useState("");
  // Renamed for clarity: `productWeightList` instead of `productWeight`
  // Initialize with an empty array or null for better rendering logic if no data
  const [productWeightList, setProductWeightList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState({
    productWeight: "",
  });
  const history = useNavigate(); // eslint-disable-line no-unused-vars -- Added to suppress warning if not directly used
  const input = useRef();
  const context = useContext(Mycontext);

  const inputchange = (e) => {
    setFormFields(() => ({
      ...formFields,
      [e.target.name]: e.target.value,
    }));
  };

  // Fetch product weights on component mount
  useEffect(() => {
    fetchProductWeights();
  }, []); // Empty dependency array means this runs once on mount

  // Helper function to fetch data and update state
  const fetchProductWeights = async () => {
    try {
      const res = await fetchDataFromApi("/api/productWeight");
      setProductWeightList(res);
    } catch (error) {
      console.error("Error fetching product weights:", error);
      context.setAlertBox({
        open: true,
        error: true,
        msg: `Failed to fetch product weights: ${
          error.message || "Network error"
        }`,
      });
      setProductWeightList([]); // Ensure it's an empty array on error
    }
  };

  const addproductWeight = async (e) => {
    e.preventDefault(); // Correct spelling of preventDefault

    // Log the payload being sent for debugging
    console.log("Frontend attempting to send:", formFields);

    if (formFields.productWeight.trim() === "") {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please add a product weight.",
      });
      return; // Stop execution if validation fails
    }

    setIsLoading(true);

    try {
      if (editId === "") {
        // Correct API endpoint
        await postData("/api/productWeight/create", formFields);
        context.setAlertBox({
          open: true,
          error: false, // Success
          msg: "Product weight added successfully!",
        });
      } else {
        // *** CRITICAL FIX: Add leading slash to URL for putData ***
        await putData(`/api/productWeight/${editId}`, formFields);
        context.setAlertBox({
          open: true,
          error: false, // Success
          msg: "Product weight updated successfully!",
        });
        setEditId(""); // Clear editId after update
      }

      setFormFields({
        productWeight: "", // Clear the form field
      });
      fetchProductWeights(); // Refresh the list after add/update
    } catch (error) {
      console.error("Error adding/updating product weight:", error);
      // More specific error message from API response if available
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Unknown error occurred.";
      context.setAlertBox({
        open: true,
        error: true,
        msg: `Failed to ${
          editId === "" ? "add" : "update"
        } product weight: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false); // Always stop loading, even on error
    }
  };

  const deleteItem = async (id) => {
    try {
      // *** CRITICAL FIX: Add slash between resource and ID for deleteData ***
      await deleteData(`/api/productWeight/${id}`);
      context.setAlertBox({
        open: true,
        error: false,
        msg: "Product weight deleted successfully!",
      });
      fetchProductWeights(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting product weight:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Unknown error occurred.";
      context.setAlertBox({
        open: true,
        error: true,
        msg: `Failed to delete product weight: ${errorMessage}`,
      });
    }
  };

  const updateData = async (id) => {
    input.current.focus();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    try {
      const res = await fetchDataFromApi(`/api/productWeight/${id}`);
      setEditId(id);
      setFormFields({
        productWeight: res.productWeight,
      });
    } catch (error) {
      console.error("Error fetching data for update:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Unknown error occurred.";
      context.setAlertBox({
        open: true,
        error: true,
        msg: `Failed to load product weight for editing: ${errorMessage}`,
      });
    }
  };

  return (
    <>
      <div className="right-content w-100">
        {/* Breadcrumb Header */}
        <div className="card shadow mybreadcrumb border-0 w-100 flex-row p-4 align-items-center justify-content-between">
          <h5 className="mb-0">Product Weight</h5>{" "}
          {/* Changed from Product View */}
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
                label="Add Weight" // Changed from Upload
                deleteIcon={<ExpandMoreIcon />}
                onDelete={() => {}}
              />
            </Breadcrumbs>
          </div>
        </div>

        {/* Form Section */}
        <form className="form" onSubmit={addproductWeight}>
          <div className="row">
            <div className="col-sm-11">
              <div className="card p-4">
                <h5 className="text-white">Product Weight Information</h5>{" "}
                {/* Changed title */}
                <div className="form-group">
                  <h6>Product Weight</h6>
                  <input
                    type="text"
                    className="form-control"
                    name="productWeight" // Must match formFields key
                    placeholder="Enter product weight (e.g., 100g, 1kg, 500ml)" // More descriptive placeholder
                    value={formFields.productWeight}
                    onChange={inputchange}
                    ref={input}
                  />
                </div>
                <Button
                  className="btn-blue btn-lg w-100"
                  type="submit" // Important for form submission
                  disabled={isLoading} // Disable button when loading
                >
                  <FaCloudUploadAlt className="MR-3 btn-bg" />
                  &nbsp;{" "}
                  {isLoading ? (
                    <CircularProgress
                      color="inherit"
                      size={24}
                      className="loder"
                    /> // Added size for better appearance
                  ) : editId ? (
                    "UPDATE WEIGHT" // Specific text for update mode
                  ) : (
                    "ADD WEIGHT" // Specific text for add mode
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Display Product Weights */}
        <div className="card shadow my-4 p-4">
          <h5>Existing Product Weights</h5>
          {/* Check if productWeightList is an array and has items */}
          {productWeightList && productWeightList.length > 0 ? (
            <ul>
              {productWeightList.map((weight) => (
                <li
                  key={weight._id} // Use _id from Mongoose
                  className="d-flex justify-content-between align-items-center mb-2"
                >
                  <span>{weight.productWeight}</span>
                  <div>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => updateData(weight._id)}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => deleteItem(weight._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No product weights found. Add one above!</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AddProductWeight;
