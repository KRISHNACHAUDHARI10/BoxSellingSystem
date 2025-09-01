import * as React from "react";
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import HomeIcon from "@mui/icons-material/Home";
import { emphasize } from "@mui/system";
import { styled } from "@mui/material/styles";
import { IoCloseSharp } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Mycontext } from "../../../App";
import { fetchDataFromApi, deleteData } from "../../../utils/api";

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

const SubCategoryList = () => {
  const [catList, setCatList] = useState([]);
  const context = useContext(Mycontext);

  useEffect(() => {
    window.scrollTo(0, 0);
    context.setProgress(20);
    fetchDataFromApi("/api/category").then((res) => {
      if (res?.categoryList && Array.isArray(res.categoryList)) {
        setCatList(res.categoryList);
      }
      context.setProgress(100);
    });
  }, []);

  // Function to delete a subcategory
  const handleDeleteSubcategory = async (parentCatId, subcatId) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        context.setProgress(30);
        // Adjust this endpoint to match your backend!
        const result = await deleteData(`/api/category/${subcatId}`);

        if (result?.success || result?.deletedCount > 0) {
          // Remove subcat from UI
          setCatList((prev) =>
            prev.map((cat) =>
              cat.id === parentCatId
                ? {
                    ...cat,
                    children: cat.children.filter((c) => c.id !== subcatId),
                  }
                : cat
            )
          );
          context.setAlertBox({
            open: true,
            msg: "Subcategory deleted successfully!",
            error: false,
          });
        } else {
          context.setAlertBox({
            open: true,
            msg: result?.message || "Failed to delete subcategory.",
            error: true,
          });
        }
      } catch (error) {
        context.setAlertBox({
          open: true,
          msg: error?.message || "Error deleting subcategory.",
          error: true,
        });
      } finally {
        context.setProgress(100);
      }
    }
  };

  return (
    <div className="right-content w-100 ">
      <div className="card shadow mybreadcrumb border-0 w-100 flex-row p-4 align-items-center justify-content-between">
        <h5 className="mb-0">SubCategory List</h5>
        <div role="presentation">
          <Breadcrumbs aria-label="breadcrumb">
            <StyledBreadcrumb
              component="a"
              href="#"
              label="Home"
              icon={<HomeIcon fontSize="small" />}
            />
            <StyledBreadcrumb
              component="a"
              href="#"
              label="Sub Categories List"
            />
            <Link to="/subcategory/add">
              <Button className="btn-blue ml-3 pl-3 pr-3">
                Add SubCategory
              </Button>
            </Link>
          </Breadcrumbs>
        </div>
      </div>

      <div className="card shadow border-0 p-3 mt-4">
        <h4 className="hd">All SubCategories</h4>
        <div className="table-responsive mt-3">
          <table className="table table-bordered v-align">
            <thead className="thead-dark">
              <tr>
                <th style={{ width: "130px" }}>Category Image</th>
                <th>Category</th>
                <th>SubCategories</th>
              </tr>
            </thead>
            <tbody>
              {catList.map((item) => {
                if (item?.children && item.children.length > 0) {
                  return (
                    <tr key={item._id}>
                      <td>
                        {item.images && item.images.length > 0 ? (
                          <div
                            className="imgWrapper"
                            style={{ width: "60px", flex: "0 0 60px" }}
                          >
                            <div className="img card shadow m-0">
                              <LazyLoadImage
                                alt="category"
                                effect="blur"
                                className="w-100"
                                src={item.images[0]}
                              />
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              width: "60px",
                              height: "60px",
                              background: "#eee",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            N/A
                          </div>
                        )}
                      </td>
                      <td>{item.name}</td>
                      <td>
                        {item.children.map((subcat) => (
                          <span
                            className="badge badge-primary mx-1"
                            key={subcat._id}
                            style={{
                              fontSize: "16px",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            {subcat.name}
                            <MdDelete
                              className="cursor-pointer ml-1"
                              title="Delete Subcategory"
                              onClick={() =>
                                handleDeleteSubcategory(item._id, subcat._id)
                              }
                              style={{
                                marginLeft: "5px",
                                color: "#fff",
                                cursor: "pointer",
                              }}
                            />
                          </span>
                        ))}
                      </td>
                    </tr>
                  );
                }
                return null;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubCategoryList;
