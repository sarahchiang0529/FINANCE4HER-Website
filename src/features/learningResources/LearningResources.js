import "./LearningResources.css"

const data = [
  { title: "Week 1", description: "xxx" },
  { title: "Week 2", description: "xxx" },
  { title: "Week 3", description: "xxx" },
  { title: "Week 4", description: "xxx" },
  { title: "Week 5", description: "xxx" },
  { title: "Week 6", description: "xxx" },
  { title: "Week 7", description: "xxx" },
  { title: "Week 8", description: "xxx" },
]

const LearningResources = () => {
  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Learning Resources</h1>
        <p className="page-subtitle">Expand your financial knowledge and skills</p>
      </div>

      <div className="card-grid">
        {data.map((item, index) => (
          <div className="resource-card" key={index}>
            <h3 className="resource-card-title">{item.title}</h3>
            <p className="resource-card-description">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LearningResources