import React from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import "../stylesheets/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__bottom">
          <span className="footer__copy">
            &copy; 2024 EmpowHERto.org, All Rights Reserved.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;