import "../stylesheets/PageWrapper.css";

const PageWrapper = ({ children }) => {
  return (
    <div className="page-wrapper">
      <div className="main-content">{children}</div>
    </div>
  );
};

export default PageWrapper;