import React, { useState, useEffect, useContext } from "react";
import HomeSlider from "./slider/HomeSlider";
import Catsliders from "../../components/catslider";
import Banners from "../../components/banners";
import Products from "../../components/Product";
import Slider from "react-slick";
import cartanner from "../../assets/images/cartanner.jpg";
import TopProducts from "../Home/Topproducts/index";
import { fetchDataFromApi } from "../../utils/api";
import "./style.css";
import { MyContext } from "../../App";

const Home = () => {
  const myContext = useContext(MyContext);
  const [popularCategories, setPopularCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all"); // Set "all" as default
  const [FilterData, setFilterData] = useState([]);
  const [dailyBestProducts, setDailyBestProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingDailyBest, setLoadingDailyBest] = useState(false);
  const [categoryError, setCategoryError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [homeSlides, setHomeSlides] = useState([]);

  // Fetch products immediately when component mounts (for "all" category)
  useEffect(() => {
    const fetchInitialProducts = async () => {
      setIsLoading(true);
      const location = localStorage.getItem("location") || "";

      try {
        // Fetch all products by default
        const res = await fetchDataFromApi(
          `/api/products?location=${location}`
        );
        console.log("API response for initial products", res);
        setFilterData(res?.products || []);

        // Also fetch home banner
        const bannerRes = await fetchDataFromApi("/api/homeBanner");
        setHomeSlides(bannerRes || []);
      } catch (error) {
        console.error("Error fetching initial products:", error);
        setFilterData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialProducts();
  }, []); // Run only on mount

  // Fetch products when selectedCategory changes (but skip initial "all")
  useEffect(() => {
    // Skip if it's the initial "all" selection or if selectedCategory is null/undefined
    if (selectedCategory === null || selectedCategory === undefined) {
      return;
    }

    // Skip the initial "all" load since we already loaded it above
    if (selectedCategory === "all" && FilterData.length > 0) {
      return;
    }

    const fetchCategoryProducts = async () => {
      setIsLoading(true);
      const location = localStorage.getItem("location") || "";

      try {
        let url = "";
        if (selectedCategory === "all") {
          url = `/api/products?location=${location}`;
        } else {
          url = `/api/products?catId=${selectedCategory}&location=${location}`;
        }

        const res = await fetchDataFromApi(url);
        console.log("API response for category products", res);
        setFilterData(res?.products || []);
      } catch (error) {
        console.error("Error fetching category products:", error);
        setFilterData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [selectedCategory]); // This will run when category changes

  // Fetch daily best sells products
  useEffect(() => {
    const fetchDailyBestProducts = async () => {
      try {
        setLoadingDailyBest(true);
        const location = localStorage.getItem("location") || "";

        // Try to fetch products specifically for daily best sells
        const res = await fetchDataFromApi(
          `/api/products?location=${location}&limit=10`
        );

        if (res?.products && Array.isArray(res.products)) {
          // Reverse the array to show newest first
          const reversedProducts = [...res.products].reverse();
          setDailyBestProducts(reversedProducts.slice(0, 10)); // Take only first 10
        } else {
          setDailyBestProducts([]);
        }
      } catch (error) {
        console.error("Error fetching daily best products:", error);
        setDailyBestProducts([]);
      } finally {
        setLoadingDailyBest(false);
      }
    };

    fetchDailyBestProducts();
  }, []);

  // Use FilterData for daily best sells if dailyBestProducts is empty
  useEffect(() => {
    if (
      FilterData.length > 0 &&
      dailyBestProducts.length === 0 &&
      !loadingDailyBest
    ) {
      // Use filtered products in reverse order as fallback
      const reversedFilterData = [...FilterData].reverse().slice(0, 10);
      setDailyBestProducts(reversedFilterData);
    }
  }, [FilterData, dailyBestProducts.length, loadingDailyBest]);

  // Fetch popular categories
  useEffect(() => {
    const fetchPopularCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await fetchDataFromApi("/api/category");

        if (res?.categoryList && Array.isArray(res.categoryList)) {
          const allCategories = res.categoryList.map((cat) => ({
            ...cat,
            parentName: cat.name,
            parentId: cat._id,
          }));

          setPopularCategories(allCategories);
        } else {
          setPopularCategories([]);
        }
      } catch (err) {
        console.error("API Error fetching popular categories:", err);
        setCategoryError("Failed to load popular categories.");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchPopularCategories();
  }, []);

  const handleCategoryClick = (catId) => {
    console.log("Category clicked:", catId); // Debug log
    setSelectedCategory(catId);
  };

  // Show loading only for categories, not for the entire page
  if (loadingCategories) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "200px" }}
      >
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading categories...</span>
        </div>
      </div>
    );
  }

  if (categoryError) {
    return (
      <div className="alert alert-danger text-center">
        Error: {categoryError}
      </div>
    );
  }

  var settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    fade: false,
    arrows: true,
    autoplay: 3000,
    centerMode: true,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } },
    ],
  };

  // Function to get product tags for daily best sells
  const getDailyBestTag = (index) => {
    const tags = ["hot", "sale", "best", "new", "trending"];
    return tags[index % tags.length];
  };

  if (isLoading && FilterData.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading homepage...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {homeSlides?.length !== 0 && <HomeSlider data={homeSlides} />}

      <Catsliders />

      <section className="homeProducts">
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 className="hd mb-0 mt-0">Popular Products</h2>
            <div className="category-slider" style={{ width: "70%" }}>
              <Slider
                dots={false}
                infinite={false}
                speed={500}
                slidesToShow={5}
                slidesToScroll={2}
                arrows={true}
                responsive={[
                  { breakpoint: 1200, settings: { slidesToShow: 4 } },
                  { breakpoint: 992, settings: { slidesToShow: 3 } },
                  { breakpoint: 768, settings: { slidesToShow: 2 } },
                  { breakpoint: 576, settings: { slidesToShow: 1 } },
                ]}
              >
                <div
                  className={`category-tab ${
                    selectedCategory === "all" ? "active" : ""
                  }`}
                  onClick={() => handleCategoryClick("all")}
                  style={{ cursor: "pointer" }}
                >
                  All
                </div>

                {popularCategories.map((cat) => (
                  <div
                    key={cat._id}
                    className={`category-tab ${
                      selectedCategory === cat._id ? "active" : ""
                    }`}
                    onClick={() => handleCategoryClick(cat._id)}
                    style={{ cursor: "pointer" }}
                  >
                    {cat.name}
                  </div>
                ))}
              </Slider>
            </div>
          </div>

          <div className="productRow">
            {isLoading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "200px" }}
              >
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading products...</span>
                </div>
              </div>
            ) : FilterData && FilterData.length > 0 ? (
              FilterData.map((item, index) => (
                <div className="item" key={item._id || item.id || index}>
                  <Products item={item} />
                </div>
              ))
            ) : (
              <div className="text-center p-4">
                <p className="text-muted">
                  No products found for the selected category.
                </p>
                <button
                  className="btn btn-success"
                  onClick={() => handleCategoryClick("all")}
                >
                  View All Products
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      <Banners />
      <section className="homeProducts homeProductsRow2 pt-0">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <h2 className="hd mb-0 mt-0">Daily Best Sells</h2>
          </div>
          <br />
          <div className="row">
            <div className="col-md-3 pr-5">
              <img src={cartanner} className="w-100 cart-my" alt="Banner" />
            </div>
            <div className="col-md-9">
              {loadingDailyBest ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ height: "200px" }}
                >
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">
                      Loading daily best products...
                    </span>
                  </div>
                </div>
              ) : (
                <Slider {...settings} className="prodSlider">
                  {dailyBestProducts.length > 0 ? (
                    dailyBestProducts.map((product, index) => (
                      <div
                        className="item"
                        key={product._id || product.id || index}
                      >
                        <Products item={product} tag={getDailyBestTag(index)} />
                      </div>
                    ))
                  ) : (
                    <div className="item">
                      <div className="text-center p-4">
                        <p className="text-muted">
                          No daily best products available
                        </p>
                      </div>
                    </div>
                  )}
                </Slider>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
