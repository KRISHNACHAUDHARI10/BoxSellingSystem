import * as React from "react";
import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import { FaCloudUploadAlt, FaRegImages } from "react-icons/fa";
import Button from "@mui/material/Button";
import HomeIcon from "@mui/icons-material/Home";
import { emphasize } from "@mui/system";
import { styled } from "@mui/material/styles";
import { IoCloseSharp } from "react-icons/io5";
import { Mycontext } from "../../../App";
import { postData, uploadImage, deleteImages } from "../../../utils/api";
import CircularProgress from "@mui/material/CircularProgress";
import "./appcat.css";

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

const AddCategory = () => {
  const context = useContext(Mycontext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formFields, setFormFields] = useState({
    name: "",
    images: [],
    color: "",
    slug: "",
    parentId: "",
  });
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update the formFields state whenever the previews array changes
  useEffect(() => {
    setFormFields((prev) => ({
      ...prev,
      images: previews,
    }));
  }, [previews]);

  const changeInput = (e) => {
    setFormFields((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onChageFile = async (e) => {
    const files = e.target.files;

    // ... (file validation logic remains the same)

    const currentFormData = new FormData();
    for (let i = 0; i < files.length; i++) {
      currentFormData.append("images", files[i]);
    }

    try {
      setUploading(true);
      context.setProgress(30);

      const uploadResponse = await uploadImage(
        "/api/category/upload",
        currentFormData
      );

      // Corrected: Check for the 'images' property in the response object.
      if (
        uploadResponse &&
        uploadResponse.success &&
        Array.isArray(uploadResponse.images) &&
        uploadResponse.images.length > 0
      ) {
        setPreviews((prev) => [...prev, ...uploadResponse.images]);
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Images Uploaded successfully!",
        });
      } else {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Images uploaded, but no new image URLs were received from the server.",
        });
      }
    } catch (error) {
      // ... (error handling remains the same)
    } finally {
      setUploading(false);
      context.setProgress(100);
    }
  };

  // In your frontend AddCategory component
  const removeImg = async (imgUrl) => {
    try {
      // Call the new, specific API route for deleting a single image
      await deleteImages(
        `/api/category/delete-image?imgUrl=${encodeURIComponent(imgUrl)}`
      );

      // Remove the image from the local state
      const updatedPreviews = previews.filter((img) => img !== imgUrl);
      setPreviews(updatedPreviews);

      context.setAlertBox({
        open: true,
        error: false,
        msg: "Image Deleted!",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      let errorMessage = "Failed to delete image.";
      if (error.response) {
        errorMessage = error.response.data?.message || "Server error";
      }
      context.setAlertBox({
        open: true,
        error: true,
        msg: errorMessage,
      });
    }
  };

  const addCat = async (e) => {
    e.preventDefault();

    if (
      formFields.name.trim() !== "" &&
      formFields.color.trim() !== "" &&
      previews.length > 0
    ) {
      setIsLoading(true);
      context.setProgress(30);

      try {
        const payload = {
          name: formFields.name,
          color: formFields.color,
          images: formFields.images,
          parentId: formFields.parentId, // This will be "" for top-level categories
        };

        await postData(`/api/category/create`, payload);

        setIsLoading(false);
        context.setProgress(100);
        context.setAlertBox({
          open: true,
          msg: "Category added successfully!",
          error: false,
        });

        // Assuming this function exists to refresh your category data in the App component
        if (context.fetchCategory) {
          context.fetchCategory();
        }

        navigate("/category");
      } catch (error) {
        setIsLoading(false);
        context.setProgress(100);

        console.error("Failed to add category:", error);

        let errorMessage = "Failed to add category.";
        if (error.response) {
          errorMessage =
            error.response.data?.error ||
            error.response.data?.message ||
            `Server Error: ${error.response.status}`;
        } else if (error.request) {
          errorMessage =
            "Network Error: No response from server. Check your connection.";
        } else {
          errorMessage = error.message;
        }

        context.setAlertBox({
          open: true,
          msg: errorMessage,
          error: true,
        });
      }
    } else {
      context.setAlertBox({
        open: true,
        msg: "Please fill in all required fields (Name, Color) and upload at least one image.",
        error: true,
      });
    }
  };

  return (
    <div className="right-content w-100 p-3">
      <div className="card shadow mybreadcrumb border-0 w-100 flex-row p-4 align-items-center justify-content-between">
        <h5 className="mb-0">Add Category</h5>
        <div role="presentation">
          <Breadcrumbs aria-label="breadcrumb">
            <StyledBreadcrumb
              component="a"
              href="#"
              label="Home"
              icon={<HomeIcon fontSize="small" />}
            />
            <StyledBreadcrumb component="a" href="#" label="Category" />
            <Link to="/category/add">
              <Button variant="contained" className="ml-3">
                Add Category
              </Button>
            </Link>
          </Breadcrumbs>
        </div>
      </div>

      <form className="form mt-4" onSubmit={addCat}>
        <div className="row">
          <div className="col-md-9">
            <div className="card p-4">
              <div className="form-group mb-3">
                <label>
                  <strong>Category Name</strong>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formFields.name}
                  onChange={changeInput}
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label>
                  <strong>Color</strong>
                </label>
                <input
                  type="text"
                  name="color"
                  className="form-control"
                  value={formFields.color}
                  onChange={changeInput}
                  placeholder="Enter color"
                  required
                />
              </div>

              <div className="mb-4">
                <h5 className="mb-3">Media and Publishing</h5>
                <div className="imgUploadSec d-flex align-items-center gap-3 flex-wrap">
                  {previews.length > 0 &&
                    previews.map((img, index) => (
                      <div className="uploadBox position-relative" key={img}>
                        <span
                          className="remove position-absolute"
                          onClick={() => removeImg(img)}
                        >
                          <IoCloseSharp />
                        </span>
                        <div className="box border rounded overflow-hidden">
                          <LazyLoadImage
                            alt={`Uploaded image ${index + 1}`}
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
                          onChange={onChageFile}
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
              </div>

              <div className="form-group mt-4 text-end">
                <Button
                  type="submit"
                  className="btn-blue btn-lg btn-big w-100"
                  disabled={isLoading || uploading}
                >
                  <FaCloudUploadAlt /> &nbsp;
                  {isLoading ? (
                    <CircularProgress color="inherit" className="loader" />
                  ) : (
                    "Add Category"
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

export default AddCategory;
