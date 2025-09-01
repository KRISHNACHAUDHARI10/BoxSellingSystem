import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import Button from "@mui/material/Button";
import { Send } from "lucide-react";
import "./slider.css";
import NewsletterForm from "../../../components/news";
import { fetchDataFromApi } from "../../../utils/api";

const HomeSlider = ({ data }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const location = localStorage.getItem("location");
    if (location !== null && location !== "" && location !== undefined) {
      fetchDataFromApi(`/api/products/featured?location=${location}`).then(
        (res) => {
          setFeaturedProducts(res);
        }
      );
    }
  }, []);

  // Check if data exists and has images
  if (!data || !data.data || data.data.length === 0) {
    return null;
  }

  return (
    <section className="homeSlider">
      <div className="container-fluid position-relative">
        <Slider {...settings} className="home_slider_Main">
          {data.data.map((slider, sliderIndex) => {
            // Check if slider has images array
            if (slider.images && slider.images.length > 0) {
              return slider.images.map((image, imageIndex) => (
                <div className="item" key={`${sliderIndex}-${imageIndex}`}>
                  <img
                    src={image}
                    className="w-100"
                    alt={`Slide ${sliderIndex + 1}-${imageIndex + 1}`}
                    style={{
                      height: "400px",
                      objectFit: "cover",
                    }}
                  />
                  {/* You can add overlay content here if needed */}
                  <div className="info">
                    <h2 className="mb-4">
                      Don't miss amazing
                      <br />
                      Boxes deals
                    </h2>
                    <p>Sign up for the daily Newsletter</p>
                  </div>
                </div>
              ));
            }
            return null;
          })}
        </Slider>

        <div className="newLetterBanner">
          <Send />
          <input type="text" placeholder="Your email address" />
          <Button className="bg-success">Subscribe</Button>
        </div>
      </div>
    </section>
  );
};

export default HomeSlider;
