import "./Desktop5LearningResources.css";

export const Desktop5LearningResources = ({ className, ...props }) => {
  return (
    <div className={"desktop-5-learning-resources " + className}>

      <div className="rectangle-236"></div>
      <div className="rectangle-239"></div>
      <div className="rectangle-237"></div>
      <div className="rectangle-238"></div>
      <div className="suggested-services">Suggested Services </div>
      <div className="investing-tips">Investing Tips </div>
      <div className="daily-tutorial">Daily Tutorial </div>
      <div className="saving-tips">Saving Tips </div>
    </div>
  );
};

export default Desktop5LearningResources;