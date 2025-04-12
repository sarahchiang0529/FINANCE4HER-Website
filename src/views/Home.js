import React, { Fragment } from "react";
import PageWrapper from "../components/PageWrapper"; 
import Hero from "../components/Hero";
import Content from "../components/Content";

const Home = () => (
  <PageWrapper> 
    <Fragment>
      <Hero />
      <hr />
      <Content />
    </Fragment>
  </PageWrapper>
);

export default Home;
