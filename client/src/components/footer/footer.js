import React from "react";
import "./footer.css";
import { Link } from "react-router-dom";
import { MapPinned, Phone, Mail, Clock, Headset } from "lucide-react";
import {
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaTwitter,
} from "react-icons/fa";

import icon1 from "../../assets/images/icon1.png";
import icon2 from "../../assets/images/icon2.png";
import icon3 from "../../assets/images/icon3.png";
import icon4 from "../../assets/images/icon4.png";
import icon5 from "../../assets/images/icon5.png";
import logo from "../../assets/images/logo.jpg";
import google from "../../assets/images/google.png";
import boxman from "../../assets/images/boxman.jpg";
import playstore from "../../assets/images/playstore.png";
import News from "../../components/news";

const Footer = () => {
  const featureData = [
    {
      icon: icon1,
      title: "Best prices & offers",
      description: "Orders $50 or more",
    },
    {
      icon: icon2,
      title: "Free Delivery",
      description: "On all orders",
    },
    {
      icon: icon3,
      title: "Wide Assortment",
      description: "Mega Discounts",
    },
    {
      icon: icon4,
      title: "Easy Returns",
      description: "Within 30 days",
    },
    {
      icon: icon5,
      title: "Safe Delivery",
      description: "100% Secure",
    },
  ];

  return (
    <>
      {/* Newsletter Banner Section */}
      <section className="newsletterSection">
        <div className="container-fluid">
          <div className="newsletterBox">
            <div className="newsletterContent">
              <div className="textContent">
                <h2>Stay home & get your daily needs from your home</h2>
                <p>Start your Daily Shopping with BoxDekho</p>
                <div className="newsletterForm">
                  <News />
                </div>
              </div>
              <div className="newsletterImage">
                <img src={boxman} alt="Newsletter" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Boxes Section */}
      <section className="featuresSection">
        <div className="container-fluid">
          <div className="row g-4">
            {featureData.map((feature, idx) => (
              <div key={idx} className="col-lg col-md-6 col-12">
                <div className="featureBox">
                  <div className="featureIcon">
                    <img src={feature.icon} alt={feature.title} />
                  </div>
                  <div className="featureInfo">
                    <h6>{feature.title}</h6>
                    <p>{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Footer Section */}
      <footer className="mainFooter">
        <div className="container-fluid">
          <div className="row">
            {/* Company Information */}
            <div className="col-lg-3 col-md-6 col-12 mb-4">
              <div className="footerSection">
                <Link to="/" className="footerLogo">
                  <img src={logo} alt="Logo" />
                  <span className="app-name">
                    <b>BoxDekho</b>
                  </span>
                </Link>
                <p className="footerDescription">Awesome box shop website</p>

                <div className="contactInfo">
                  <div className="contactItem">
                    <MapPinned size={16} />
                    <span>
                      <strong>Address:</strong> 35-plot, Mahalakshmi Apartment,
                      Udhna, Surat, Gujarat
                    </span>
                  </div>
                  <div className="contactItem">
                    <Phone size={16} />
                    <span>
                      <strong>Call Us:</strong> (+91)-9512707825
                    </span>
                  </div>
                  <div className="contactItem">
                    <Mail size={16} />
                    <span>
                      <strong>Email:</strong> krishnachaudhari0340@gmail.com
                    </span>
                  </div>
                  <div className="contactItem">
                    <Clock size={16} />
                    <span>
                      <strong>Hours:</strong> 10:00 - 18:00, Mon - Sat
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="col-lg-6 col-md-6 col-12 mb-4">
              <div className="row">
                <div className="col-md-4 col-12 mb-3">
                  <div className="footerSection">
                    <h5>Company</h5>
                    <ul className="footerLinks">
                      <li>
                        <Link to="/about">About Us</Link>
                      </li>
                      <li>
                        <Link to="/blog">Blog</Link>
                      </li>
                      <li>
                        <Link to="/contacts">Contact Us</Link>
                      </li>
                      <li>
                        <Link to="/listing">Our Products</Link>
                      </li>
                      <li>
                        <Link to="/">Privacy Policy</Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-md-4 col-12 mb-3">
                  <div className="footerSection">
                    <h5>Account</h5>
                    <ul className="footerLinks">
                      <li>
                        <Link to="/login">Sign In</Link>
                      </li>
                      <li>
                        <Link to="/signup">Create Account</Link>
                      </li>
                      <li>
                        <Link to="/orders">My Orders</Link>
                      </li>
                      <li>
                        <Link to="/watchlist">My Wishlist</Link>
                      </li>
                      <li>
                        <Link to="/cart">Shopping Cart</Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-md-4 col-12 mb-3">
                  <div className="footerSection">
                    <h5>Support</h5>
                    <ul className="footerLinks">
                      <li>
                        <Link to="/contacts">Help Center</Link>
                      </li>
                      <li>
                        <Link to="/search">Find Products</Link>
                      </li>
                      <li>
                        <Link to="/checkout">Checkout Help</Link>
                      </li>
                      <li>
                        <Link to="/orders">Track Orders</Link>
                      </li>
                      <li>
                        <Link to="/contacts">Customer Service</Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* App Download */}
            <div className="col-lg-3 col-md-12 col-12 mb-4">
              <div className="footerSection">
                <h5>Get Our App</h5>
                <p>Download from official stores - Coming Soon!</p>
                <div className="appLinks">
                  <Link to="#" className="appLink disabled" title="Coming Soon">
                    <img src={google} alt="Google Play - Coming Soon" />
                    <span className="comingSoon">Coming Soon</span>
                  </Link>
                  <Link to="#" className="appLink disabled" title="Coming Soon">
                    <img src={playstore} alt="App Store - Coming Soon" />
                    <span className="comingSoon">Coming Soon</span>
                  </Link>
                </div>
                <p className="securePayments">100% Secured Payment Gateways</p>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footerBottom">
            <div className="row align-items-center">
              <div className="col-lg-4 col-md-12 text-center text-lg-start mb-3 mb-lg-0">
                <p className="copyright">
                  © 2024, BoxDekho - Your Box Shopping Destination. All rights
                  reserved.
                </p>
              </div>
              <div className="col-lg-4 col-md-12 text-center mb-3 mb-lg-0">
                <div className="supportContact">
                  <Headset size={28} />
                  <div className="supportInfo">
                    <h6>1900 - 888</h6>
                    <p>24/7 Support Center</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-12 text-center text-lg-end">
                <div className="socialSection">
                  <h6>Follow Us</h6>
                  <div className="socialLinks">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      title="Follow us on Instagram"
                    >
                      <FaInstagram />
                    </a>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noreferrer"
                      title="Like us on Facebook"
                    >
                      <FaFacebookF />
                    </a>
                    <a
                      href="https://wa.me/919512707825"
                      target="_blank"
                      rel="noreferrer"
                      title="WhatsApp us"
                    >
                      <FaWhatsapp />
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noreferrer"
                      title="Follow us on Twitter"
                    >
                      <FaTwitter />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
