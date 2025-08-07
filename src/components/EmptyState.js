// Universal Empty State component that can be used across the application
const EmptyState = ({ title, message, icon }) => {
  return (
    <div className="universal-empty-state text-center">
      <div className="universal-empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p className="mx-auto">{message}</p>
    </div>
  )
}

export default EmptyState