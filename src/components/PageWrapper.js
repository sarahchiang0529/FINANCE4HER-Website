import "../stylesheets/PageWrapper.css"

const PageWrapper = ({ children }) => {
  return (
    <div className="page-wrapper">
      <div className="page-content">{children}</div>
    </div>
  )
}

export default PageWrapper