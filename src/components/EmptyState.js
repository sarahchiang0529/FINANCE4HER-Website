// Universal Empty State component that can be used across the application
const EmptyState = ({ title, message, icon }) => {
  return (
    <div className="universal-empty-state">
      <div className="universal-empty-state-icon">
        {icon || (
          <svg
            className="target-icon-svg"
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="24" cy="24" r="20" stroke="#8A4BAF" strokeWidth="4" />
            <circle cx="24" cy="24" r="12" stroke="#8A4BAF" strokeWidth="4" />
            <circle cx="24" cy="24" r="4" fill="#8A4BAF" />
          </svg>
        )}
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  )
}

export default EmptyState