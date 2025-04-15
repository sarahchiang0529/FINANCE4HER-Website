import PageWrapper from "../components/PageWrapper"; 
import "../stylesheets/LearningResources.css";
import { BookOpen, FileText, Play, PlusCircle } from 'lucide-react';

const LearningResources = () => {
  // Resource types with icons
  const resources = [
    {
      title: "Articles",
      description: "Read expert financial advice",
      icon: <FileText size={32} className="text-purple-500" />
    },
    {
      title: "Videos",
      description: "Watch financial tutorials",
      icon: <Play size={32} className="text-purple-500" />
    },
    {
      title: "Case Studies",
      description: "Learn from real-life examples",
      icon: <BookOpen size={32} className="text-purple-500" />
    },
    {
      title: "Quizzes",
      description: "Test your financial knowledge",
      icon: <PlusCircle size={32} className="text-purple-500" />
    }
  ];

  return (
    <PageWrapper>
      <div className="learning-resources-container">
        <div className="page-header">
          <h1 className="page-title">Learning Resources</h1>
          <p className="page-subtitle">Expand your financial knowledge and skills</p>
        </div>

        <div className="resources-grid">
          {resources.map((resource, index) => (
            <div key={index} className="resource-item">
              <div className="resource-icon">{resource.icon}</div>
              <h3 className="resource-title">{resource.title}</h3>
              <p className="resource-description">{resource.description}</p>
            </div>
          ))}
        </div>

        <div className="resource-card">
          <h2 className="card-title">Featured Articles</h2>
          <p className="card-description">Latest financial insights to help you grow</p>
          <div className="resources-content">
            <p>Featured articles content will go here</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default LearningResources;