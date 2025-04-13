import React from "react";
import "../stylesheets/LearningResources.css";
import PageWrapper from "../components/PageWrapper";

export const LearningResources = () => {
  const handleClick = (title) => {
    console.log(`${title} clicked`);
  };

  return (
    <PageWrapper>
      <div className="desktop-5-learning-resources">
        <div className="squares-wrapper">
          <div className="squares-container">
            <div
              className="rectangle"
              onClick={() => handleClick("Articles")}
            >
              <div className="rectangle-title">Articles</div>
            </div>
            <div
              className="rectangle"
              onClick={() => handleClick("Videos")}
            >
              <div className="rectangle-title">Videos</div>
            </div>
            <div
              className="rectangle"
              onClick={() => handleClick("Case Studies")}
            >
              <div className="rectangle-title">Case Studies</div>
            </div>
            <div
              className="rectangle"
              onClick={() => handleClick("Quizzes")}
            >
              <div className="rectangle-title">Quizzes</div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default LearningResources;