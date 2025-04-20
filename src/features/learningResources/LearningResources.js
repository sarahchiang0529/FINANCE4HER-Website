import { useState } from "react"
import "./LearningResources.css"
import { BookOpen, FileText, Play, PlusCircle } from "lucide-react"

const data = {
  Articles: [
    { title: "Week 1", description: "xxx" },
    { title: "Week 2", description: "xxx" },
    { title: "Week 3", description: "xxx" },
    { title: "Week 4", description: "xxx" },
    { title: "Week 5", description: "xxx" },
    { title: "Week 6", description: "xxx" },
    { title: "Week 7", description: "xxx" },
    { title: "Week 8", description: "xxx" },
  ],
  Videos: [
    { title: "Week 1", description: "xxx" },
    { title: "Week 2", description: "xxx" },
    { title: "Week 3", description: "xxx" },
    { title: "Week 4", description: "xxx" },
    { title: "Week 5", description: "xxx" },
    { title: "Week 6", description: "xxx" },
    { title: "Week 7", description: "xxx" },
    { title: "Week 8", description: "xxx" },
  ],
  "Case Studies": [
    { title: "Week 1", description: "xxx" },
    { title: "Week 2", description: "xxx" },
    { title: "Week 3", description: "xxx" },
    { title: "Week 4", description: "xxx" },
    { title: "Week 5", description: "xxx" },
    { title: "Week 6", description: "xxx" },
    { title: "Week 7", description: "xxx" },
    { title: "Week 8", description: "xxx" },
  ],
  Quizzes: [
    { title: "Week 1", description: "xxx" },
    { title: "Week 2", description: "xxx" },
    { title: "Week 3", description: "xxx" },
    { title: "Week 4", description: "xxx" },
    { title: "Week 5", description: "xxx" },
    { title: "Week 6", description: "xxx" },
    { title: "Week 7", description: "xxx" },
    { title: "Week 8", description: "xxx" },
  ],
}

const LearningResources = () => {
  const [activeTab, setActiveTab] = useState("Articles")

  const resources = [
    { title: "Articles", icon: <FileText size={20} /> },
    { title: "Videos", icon: <Play size={20} /> },
    { title: "Case Studies", icon: <BookOpen size={20} /> },
    { title: "Quizzes", icon: <PlusCircle size={20} /> },
  ]

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Learning Resources</h1>
        <p className="page-subtitle">Expand your financial knowledge and skills</p>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          {resources.map((res) => (
            <button
              key={res.title}
              className={`tab ${activeTab === res.title ? "active" : ""}`}
              onClick={() => setActiveTab(res.title)}
            >
              {res.icon}
              <span className="tab-label">{res.title}</span>
            </button>
          ))}
        </div>

        <div className="tab-content">
          <div className="card-grid">
            {data[activeTab].map((item, index) => (
              <div className="resource-card" key={index}>
                <h3 className="resource-card-title">{item.title}</h3>
                <p className="resource-card-description">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LearningResources