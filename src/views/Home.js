import React from "react";
import PageWrapper from "../components/PageWrapper";
import "../stylesheets/Home.css";

const Home = () => (
  <PageWrapper>
    <div className="home-container">
      <h1 className="home-title">Welcome to FINANCE4HER</h1>
      <p className="home-description">
        We're so glad you're here! FINANCE4HER is your space to learn, grow, and take control of your financial future. 
        Track your earnings, set savings goals, and build healthy money habits—one step at a time. 
        Let’s make smart choices together and celebrate your progress along the way!
      </p>
    </div>
  </PageWrapper>
);

export default Home;