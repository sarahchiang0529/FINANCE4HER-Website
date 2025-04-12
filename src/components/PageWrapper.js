import React from "react";
import "../stylesheets/PageWrapper.css";


const PageWrapper = ({ children }) => {
  return <div className="page-wrapper-with-nav">{children}</div>;
};

export default PageWrapper;
