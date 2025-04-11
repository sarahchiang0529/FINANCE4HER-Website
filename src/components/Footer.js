import React from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import "../stylesheets/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__top">
          <nav className="footer__nav">
            <RouterNavLink to="/" className="footer__link">Home</RouterNavLink>
            <RouterNavLink to="/dashboard" className="footer__link">Dashboard</RouterNavLink>
            <RouterNavLink to="/income" className="footer__link">Income</RouterNavLink>
            <RouterNavLink to="/expenses" className="footer__link">Expenses</RouterNavLink>
            <RouterNavLink to="/saving-goals" className="footer__link">Saving Goals</RouterNavLink>
            <RouterNavLink to="/learning-resources" className="footer__link">Learning Resources</RouterNavLink>
          </nav>
        </div>

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
