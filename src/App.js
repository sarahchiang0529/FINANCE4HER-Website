import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";

import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./views/Home";
import Profile from "./views/Profile";
import { useAuth0 } from "@auth0/auth0-react";
import history from "./utils/history";
import Expenses from "./views/Expenses";
import Income from "./views/Income";
import Dashboard from "./views/Dashboard";
import SavingGoal from "./views/SavingGoal";
import LearningResources from "./views/LearningResources";

// styles
import "./App.css";

// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
initFontAwesome();

const App = () => {
  const { isLoading, error } = useAuth0();

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router history={history}>
      <div id="app" className="d-flex flex-column h-100">
        <NavBar />
        <Container className="flex-grow-1 mt-5" style={{ paddingTop: "100px" }}>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/profile" component={Profile} />
            <Route path="/expenses" component={Expenses} />
            <Route path="/income" component={Income} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/saving-goals" component={SavingGoal} />
            <Route path="/learning-resources" component={LearningResources} />
          </Switch>
        </Container>
        <Footer />
      </div>
    </Router>
  );
};

export default App;