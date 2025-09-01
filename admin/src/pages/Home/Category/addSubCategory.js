import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Mycontext } from "../../../App";
import "./addsubcat.css";

import {
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import { emphasize } from "@mui/system";
import { styled } from "@mui/material/styles";
import { FaCloudUploadAlt } from "react-icons/fa";

import { fetchDataFromApi, postData } from "../../../utils/api";

// Styled breadcrumb for navigation
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

const AddSubCategory = () => {
  const context = useContext(Mycontext);

  const [subcategoryName, setSubcategoryName] = useState("");
  const [selectedParentCategory, setSelectedParentCategory] = useState("");
  const [parentCategories, setParentCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    context.setProgress(20);
    fetchDataFromApi("/api/category")
      .then((res) => {
        if (res?.categoryList && Array.isArray(res.categoryList)) {
          setParentCategories(res.categoryList);
        }
        context.setProgress(100);
      })
      .catch(() => {
        context.setAlertBox({
          open: true,
          msg: "Failed to load categories.",
          error: true,
        });
        context.setProgress(100);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    context.setProgress(30);
    setSubmitting(true);

    if (!subcategoryName.trim()) {
      context.setAlertBox({
        open: true,
        msg: "Subcategory Name is required!",
        error: true,
      });
      setSubmitting(false);
      context.setProgress(100);
      return;
    }

    if (!selectedParentCategory) {
      context.setAlertBox({
        open: true,
        msg: "Please select a Parent Category!",
        error: true,
      });
      setSubmitting(false);
      context.setProgress(100);
      return;
    }

    const payload = {
      name: subcategoryName.trim(),
      parentId: selectedParentCategory,
      images: [],
    };

    try {
      const result = await postData("/api/category/create", payload);
      if (result.success) {
        context.setAlertBox({
          open: true,
          msg: result.message || "Subcategory added successfully!",
          error: false,
        });
        setSubcategoryName("");
        setSelectedParentCategory("");
      } else {
        context.setAlertBox({
          open: true,
          msg: result.error || "Failed to add subcategory.",
          error: true,
        });
      }
    } catch (error) {
      context.setAlertBox({
        open: true,
        msg: error.message || "Failed to add subcategory.",
        error: true,
      });
    } finally {
      setSubmitting(false);
      context.setProgress(100);
    }
  };

  return (
    <div className="right-content w-100 p-3">
      {/* Breadcrumb Header */}
      <div className="card shadow mybreadcrumb border-0 w-100 flex-row p-4 align-items-center justify-content-between">
        <h5 className="mb-0">Add Subcategory</h5>
        <div role="presentation">
          <Breadcrumbs aria-label="breadcrumb">
            <StyledBreadcrumb
              component="a"
              href="#"
              label="Home"
              icon={<HomeIcon fontSize="small" />}
            />
            <StyledBreadcrumb component="a" href="#" label="Category" />
            <Link to="/subcategory/add">
              <Button variant="contained" className="ml-3">
                Add Subcategory
              </Button>
            </Link>
          </Breadcrumbs>
        </div>
      </div>

      {/* Form */}
      <form className="form mt-4" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-9">
            <div className="card p-4">
              <div className="form-group mb-4">
                <label>
                  <strong>Parent Category *</strong>
                </label>
                <FormControl fullWidth size="small">
                  <InputLabel id="parent-category-label">Select</InputLabel>
                  <Select
                    labelId="parent-category-label"
                    value={selectedParentCategory}
                    onChange={(e) => setSelectedParentCategory(e.target.value)}
                    required
                    label="Select"
                  >
                    <MenuItem value="">
                      <em>-- Select Parent Category --</em>
                    </MenuItem>
                    {parentCategories.map((cat) => (
                      <MenuItem key={cat._id} value={cat._id}>
                        {cat.customId} - {cat.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              <div className="form-group inout">
                <label>
                  <strong>Subcategory Name *</strong>
                </label>
                <TextField
                  fullWidth
                  variant="outlined"
                  required
                  size="small" // This prop makes the input field smaller
                  placeholder="Enter subcategory name"
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                />
              </div>

              <div className="form-group mt-5 text-end">
                <Button
                  type="submit"
                  className="btn-blue btn-lg btn-big w-100"
                  disabled={submitting}
                >
                  <FaCloudUploadAlt /> &nbsp;
                  {submitting ? (
                    <CircularProgress color="inherit" className="loader" />
                  ) : (
                    "Add Subcategory"
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

export default AddSubCategory;
