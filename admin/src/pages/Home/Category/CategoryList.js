import * as React from "react";
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import HomeIcon from "@mui/icons-material/Home";
import { emphasize } from "@mui/system";
import { styled } from "@mui/material/styles";
import { FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Mycontext } from "../../../App";
import { fetchDataFromApi, deleteImages, deleteData } from "../../../utils/api";

// Styled MUI Breadcrumb
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

// Memoized Row Component
const CategoryRow = React.memo(({ cat, deleteCat }) => {
  // Optimize image (Cloudinary)
  const optimizedImg = cat.images?.[0]?.includes("/upload/")
    ? cat.images[0].replace(
        "/upload/",
        "/upload/w_150,h_150,c_fill,q_auto,f_auto/"
      )
    : cat.images?.[0];

  return (
    <tr key={cat._id}>
      <td style={{ width: "160px", textAlign: "center" }}>
        {optimizedImg ? (
          <LazyLoadImage
            alt={cat.name || "Category"}
            effect="blur"
            width="100"
            height="100"
            style={{ borderRadius: "8px", objectFit: "cover" }}
            src={optimizedImg}
          />
        ) : (
          <div
            style={{
              width: "100px",
              height: "100px",
              backgroundColor: "#eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888",
              borderRadius: "8px",
            }}
          >
            No Image
          </div>
        )}
      </td>
      <td>{cat.name}</td>
      <td>
        <span
          style={{
            backgroundColor: cat.color,
            padding: "5px 10px",
            borderRadius: "5px",
            color: "#fff",
          }}
        >
          {cat.color}
        </span>
      </td>
      <td>
        <div className="action d-flex align-items-center gap-2">
          <Link to={`/category/edit/${cat._id}`}>
            <Button className="success" color="success">
              <FaPencilAlt />
            </Button>
          </Link>
          <Button
            className="error"
            color="error"
            onClick={() => deleteCat(cat._id, cat.images)}
          >
            <MdDelete />
          </Button>
        </div>
      </td>
    </tr>
  );
});

const CategoryList = () => {
  const [catList, setCatList] = useState([]);
  const context = useContext(Mycontext);

  useEffect(() => {
    window.scrollTo(0, 0);

    fetchDataFromApi("/api/category")
      .then((res) => {
        if (Array.isArray(res?.categoryList)) {
          setCatList(res.categoryList);
        } else {
          console.warn("Unexpected category list response", res);
        }
      })
      .catch((error) => {
        context.setAlertBox({
          open: true,
          msg: `Failed to fetch categories: ${
            error.message || "Unknown error"
          }`,
          error: true,
        });
        context.setProgress(100);
      });
  }, [context]);

  const deleteCat = async (categoryId, images = []) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      context.setProgress(30);

      const deleteRes = await deleteData(`/api/category/${categoryId}`);

      if (deleteRes?.success) {
        if (images.length > 0) {
          await Promise.allSettled(
            images.map((img) =>
              deleteImages(
                `/api/imageUpload/deleteImage?img=${encodeURIComponent(img)}`
              )
            )
          );
        }

        setCatList((prev) => prev.filter((cat) => cat._id !== categoryId));

        context.setAlertBox({
          open: true,
          msg: "Category deleted successfully!",
          error: false,
        });
      } else {
        context.setAlertBox({
          open: true,
          msg: deleteRes?.message || "Failed to delete the category.",
          error: true,
        });
      }
    } catch (error) {
      const backendMsg =
        error.response?.data?.message || error.response?.data?.error;
      const errMsg =
        backendMsg ||
        (error.message === "Request failed with status code 400"
          ? "Bad request. Possible reasons: invalid ID or existing subcategories."
          : error.message) ||
        "Deletion failed.";

      console.error("Delete error:", error.response?.data || error);

      context.setAlertBox({
        open: true,
        msg: `Deletion failed: ${errMsg}`,
        error: true,
      });
    } finally {
      context.setProgress(100);
    }
  };

  return (
    <div className="right-content w-100">
      <div className="card shadow mybreadcrumb border-0 w-100 flex-row p-4 align-items-center justify-content-between">
        <h5 className="mb-0">Category List</h5>
        <Breadcrumbs aria-label="breadcrumb">
          <StyledBreadcrumb
            component={Link}
            to="/"
            label="Home"
            icon={<HomeIcon fontSize="small" />}
          />
          <StyledBreadcrumb label="Categories" />
          <Link to="/category/add">
            <Button className="btn-blue ml-3 pl-3 pr-3">Add Category</Button>
          </Link>
        </Breadcrumbs>
      </div>

      <div className="card shadow border-0 p-3 mt-4">
        <h4 className="hd">All Categories</h4>
        <div className="table-responsive mt-3">
          <table className="table table-bordered v-align">
            <thead className="thead-dark">
              <tr>
                <th>Image</th>
                <th>Category</th>
                <th>Color</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {catList.length > 0 ? (
                catList.map((cat) => (
                  <CategoryRow key={cat._id} cat={cat} deleteCat={deleteCat} />
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
