import React from "react";
// If you have a logo file, import it:
import logo from "../assets/logos/logo1.png"; // Adjust path as needed

const Footer = () => {
  return (
    <footer className="bg-light p-4">
      <div className="container">
        <div className="row align-items-start">
          {/* Logo on the left */}
          <div className="col-md-2 d-flex align-items-center mb-3 mb-md-0">
            <img
              src={logo}
              alt="Brand Logo"
              style={{ width: "60px", height: "auto" }}
            />
          </div>

          {/* About Us */}
          <div className="col-md">
            <h5>About Us</h5>
            <ul className="list-unstyled">
              <li>
                <a href="/organization">Meet the Organization</a>
              </li>
              <li>
                <a href="/sponsors">Sponsors and Partners</a>
              </li>
            </ul>
          </div>

          {/* Our Programs */}
          <div className="col-md">
            <h5>Our Programs</h5>
            <ul className="list-unstyled">
              <li>
                <a href="/programs">Program Information</a>
              </li>
              <li>
                <a href="/sign-up">Sign Up Now</a>
              </li>
            </ul>
          </div>

          {/* Merchandise */}
          <div className="col-md">
            <h5>Merchandise</h5>
            <ul className="list-unstyled">
              <li>
                <a href="/catalog">Catalog</a>
              </li>
              <li>
                <a href="/sizing">Sizing</a>
              </li>
            </ul>
          </div>

          {/* Testimonials */}
          <div className="col-md">
            <h5>Testimonials</h5>
            <ul className="list-unstyled">
              <li>
                <a href="/testimonials">Learn More</a>
              </li>
            </ul>
          </div>

          {/* Contact Us / FAQs */}
          <div className="col-md">
            <h5>Contact Us / FAQs</h5>
            <ul className="list-unstyled">
              <li>
                <a href="/contact">Contact Us</a>
              </li>
              <li>
                <a href="/faqs">FAQs</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
