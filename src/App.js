import { Router, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";

// Import components from their actual locations
import Loading from "./components/Common/Loading";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import { useAuth0 } from "@auth0/auth0-react";
import history from "./utils/history";
import { FinancialProvider } from "./contexts/FinancialContext";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

// Import feature components
import Dashboard from "./features/dashboard/Dashboard";
import Expenses from "./features/finances/Expenses";
import Income from "./features/finances/Income";
import SavingGoal from "./features/savingGoal/SavingGoal";
import LearningResources from "./features/learningResources/LearningResources";
import PointsRewards from "./features/pointsRewards/PointsRewards";
import FAQ from "./features/faq/FAQ";
import Home from "./features/home/Home";
import FinancialOverview from "./features/financialOverview/FinancialOverview";
import Profile from "./features/profile/Profile";

import "./App.css"
import "./features/finances/Finances.css"
import "./features/savingGoal/SavingGoal.css"

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
    <ErrorBoundary>
      <FinancialProvider>
        <Router history={history}>
          <NavBar />
          <main className="page-content">
            <Container className="content-container">
              <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/expenses" component={Expenses} />
                <Route path="/income" component={Income} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/financial-overview" component={FinancialOverview} />
                <Route path="/saving-goals" component={SavingGoal} />
                <Route path="/learning-resources" component={LearningResources} />
                <Route path="/points-rewards" component={PointsRewards} />
                <Route path="/faq" component={FAQ} />
                <Route path="/profile" component={Profile} />
              </Switch>
            </Container>
          </main>
          <Footer />
        </Router>
      </FinancialProvider>
    </ErrorBoundary>
  );
};

export default App;