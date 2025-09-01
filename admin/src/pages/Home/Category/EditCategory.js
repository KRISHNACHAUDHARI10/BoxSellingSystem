import * as React from "react";
import { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import {
  fetchDataFromApi,
  uploadImage,
  deleteImages,
  putData, // <--- Make sure you have this in your API utils!
} from "../../../utils/api";
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

const EditCategory = () => {
  const context = useContext(Mycontext);
  const { id } = useParams();
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
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch category data when editing
  useEffect(() => {
    if (!id) return;
    const fetchCategory = async () => {
      context.setProgress?.(20);
      try {
        const res = await fetchDataFromApi(`/api/category/${id}`);
        setFormFields({
          name: res.name || "",
          images: res.images || [],
          color: res.color || "",
          slug: res.slug || "",
          parentId: res.parentId || "",
        });
        setPreviews(res.images || []);
        context.setProgress?.(100);
      } catch (error) {
        context.setProgress?.(100);
        context.setAlertBox?.({
          open: true,
          error: true,
          msg: `Failed to load category: ${error.message || "Unknown error."}`,
        });
      }
    };
    fetchCategory();
    // eslint-disable-next-line
  }, [id]);

  // Keep formFields.images in sync with previews
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
      ...(e.target.name === "name" && {
        slug: e.target.value.toLowerCase().replace(/ /g, "-"),
      }),
    }));
  };

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
          msg: "Please select valid jpg, png, or webp images file.",
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
      let newImages = [];
      if (uploadResult?.images?.length > 0) {
        newImages = uploadResult.images;
      } else if (Array.isArray(uploadResult)) {
        newImages = uploadResult;
      }
      if (newImages.length > 0) {
        setPreviews((prev) => [...prev, ...newImages]);
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

  const removeImg = async (imgUrl) => {
    try {
      await deleteImages(
        `/api/imageUpload/deleteImage?img=${encodeURIComponent(imgUrl)}`
      );
      setPreviews((prev) => prev.filter((img) => img !== imgUrl));
      context.setAlertBox({
        open: true,
        error: false,
        msg: "Image Deleted!",
      });
    } catch (error) {
      context.setAlertBox({
        open: true,
        error: true,
        msg:
          "Failed to delete image. " +
          (error.response?.data?.error || error.message || "Unknown error."),
      });
    }
  };

  const updateCat = async (e) => {
    e.preventDefault();
    if (
      formFields.name !== "" &&
      formFields.color !== "" &&
      previews.length > 0
    ) {
      setIsLoading(true);
      try {
        await putData(`/api/category/${id}`, {
          ...formFields,
          images: previews,
          slug: formFields.name.toLowerCase().replace(/ /g, "-"),
        });
        setIsLoading(false);
        context.setAlertBox({
          open: true,
          msg: "Category updated successfully!",
          error: false,
        });
        context.fetchCategory?.();
        navigate("/category");
      } catch (error) {
        setIsLoading(false);
        context.setAlertBox({
          open: true,
          msg: `Failed to update category: ${
            error.response?.data?.error || error.message || "Unknown error."
          }`,
          error: true,
        });
      }
    } else {
      context.setAlertBox({
        open: true,
        msg: "Please fill in all required fields and upload at least one image.",
        error: true,
      });
    }
  };

  return (
    <div className="right-content w-100 p-3">
      <div className="card shadow mybreadcrumb border-0 w-100 flex-row p-4 align-items-center justify-content-between">
        <h5 className="mb-0">Edit Category</h5>
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

      <form className="form mt-4" onSubmit={updateCat}>
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
                  disabled={uploading}
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
                  disabled={uploading}
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
                          onChange={(e) =>
                            onChageFile(e, "/api/imageUpload/upload")
                          }
                          disabled={uploading}
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
                          <h6 className="mt-2 mb-0">Edit Image</h6>
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
                  disabled={uploading}
                >
                  <FaCloudUploadAlt /> &nbsp;
                  {isLoading ? (
                    <CircularProgress color="inherit" className="loader" />
                  ) : (
                    "Update Category"
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

export default EditCategory;
