import { useState } from "react"
import "./LearningResources.css"
import { ChevronDown, ChevronRight } from "lucide-react"

const data = {
  Questions: [
    { title: "What are your main financial goals for this year?", answer: "" },
    { title: "How do you currently track your expenses?", answer: "" },
    { title: "What financial habits would you like to improve?", answer: "" },
    { title: "Describe your ideal financial situation in 5 years", answer: "" },
    { title: "What are your biggest financial challenges right now?", answer: "" },
    { title: "How do you make important financial decisions?", answer: "" },
    { title: "What does financial freedom mean to you?", answer: "" },
    { title: "How has your relationship with money changed over time?", answer: "" },
  ]
}

const PersonalJournal = () => {
  const [expandedItems, setExpandedItems] = useState({})
  const [answers, setAnswers] = useState({})

  const toggleExpanded = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const handleAnswerChange = (index, value) => {
    setAnswers(prev => ({
      ...prev,
      [index]: value
    }))
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Personal Journal</h1>
        <p className="page-subtitle">Reflect on your financial journey and goals</p>
      </div>

      <div className="tabs-container">
        <div className="tab-content">
          <div className="accordion-container">
            {data.Questions.map((item, index) => (
              <div className="accordion-item" key={index}>
                <button
                  className="accordion-header"
                  onClick={() => toggleExpanded(index)}
                >
                  <span className="accordion-title">{item.title}</span>
                  {expandedItems[index] ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </button>
                
                {expandedItems[index] && (
                  <div className="accordion-content">
                    <textarea
                      className="journal-input"
                      placeholder="Write your thoughts here..."
                      value={answers[index] || ""}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      rows={4}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonalJournal