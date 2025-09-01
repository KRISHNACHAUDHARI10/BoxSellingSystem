import React, { useState, useEffect } from "react";
import Footer from "../../components/footer/footer";
import Slidebar from "../../components/slidebar";
import Products from "../../components/Product";
import { fetchDataFromApi } from "../../utils/api";
import { Link } from "react-router-dom";
import "./index.css";

const Listing = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [ratingFilter, setRatingFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Build API URL with category filter
      let url = `/api/products`;
      if (selectedCategory !== "all") {
        url = `/api/products?catId=${selectedCategory}`;
      }
      const res = await fetchDataFromApi(url);
      let filtered = res?.products || [];

      // Apply price filter
      filtered = filtered.filter(
        (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
      );

      // Apply rating filter - stars and up
      if (ratingFilter && ratingFilter !== "") {
        filtered = filtered.filter((p) => {
          const productRating = parseFloat(p.rating || 0);
          const filterRating = parseFloat(ratingFilter);
          return productRating >= filterRating;
        });
      }

      setProducts(filtered);
    } catch (err) {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [selectedCategory, priceRange, ratingFilter]);

  return (
    <>
      <section className="listingPage">
        <div className="container-fluid">
          <div className="bredcrumb">
            <h2>Products</h2>
            <ul className="list list-inline mb-0">
              <li className="list-inline-item">
                <Link to="/">Home</Link>
              </li>
              <li className="list-inline-item">
                <Link to="/shop">Shop</Link>
              </li>
              <li className="list-inline-item">
                <Link to="/listing">Products</Link>
              </li>
            </ul>
          </div>

          <div className="listingData">
            <div className="d-flex flex-row">
              {/* Sidebar */}
              <div
                className="slidebarWrapper"
                style={{ minWidth: "260px", maxWidth: "300px" }}
              >
                <Slidebar
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  ratingFilter={ratingFilter}
                  setRatingFilter={setRatingFilter}
                  onApplyFilters={fetchProducts}
                />
              </div>

              {/* Main Content */}
              <div
                className="rightContent homeProducts"
                style={{ flexGrow: 1 }}
              >
                <div className="topStrip d-flex align-items-center justify-content-between mb-3">
                  <p className="mb-0">
                    We found{" "}
                    <span className="text-success fw-bold">
                      {products.length} items
                    </span>
                    {selectedCategory !== "all" && (
                      <span className="text-muted ms-2">
                        in selected category
                      </span>
                    )}
                  </p>
                  <small className="text-muted">
                    Cat: {selectedCategory}, Price: {priceRange[0]}-
                    {priceRange[1]}, Rating: {ratingFilter || "All"}
                  </small>
                  {(selectedCategory !== "all" ||
                    ratingFilter ||
                    priceRange[0] > 0 ||
                    priceRange[1] < 1000) && (
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => {
                        setSelectedCategory("all");
                        setPriceRange([0, 1000]);
                        setRatingFilter("");
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
                <div className="productRow">
                  {isLoading ? (
                    <div className="item" style={{ gridColumn: "1 / -1" }}>
                      <div className="text-center mt-5 p-5">
                        <div
                          className="spinner-border text-success"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading products...</p>
                      </div>
                    </div>
                  ) : products.length > 0 ? (
                    products.map((item, index) => (
                      <div className="item" key={item._id || index}>
                        <Products item={item} />
                      </div>
                    ))
                  ) : (
                    <div className="item" style={{ gridColumn: "1 / -1" }}>
                      <div className="text-center mt-5 p-5">
                        <h4 className="text-muted">No products found</h4>
                        <p className="text-muted">
                          Try adjusting your filters or browse all categories
                        </p>
                        <button
                          className="btn btn-success mt-3"
                          onClick={() => {
                            setSelectedCategory("all");
                            setPriceRange([0, 1000]);
                            setRatingFilter("");
                          }}
                        >
                          Show All Products
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Listing;
