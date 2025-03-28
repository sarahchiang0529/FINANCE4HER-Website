import React, { useState } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import logo from "../assets/logos/logo1.png";
import NameForm from "./NameForm";
import ChartComponent from "./ChartComponent";
import Dashboard from "../views/Dashboard";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();

  const toggle = () => setIsOpen(!isOpen);

  const logoutWithRedirect = () =>
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });

  return (
    <div className="nav-container">
      <Navbar
        dark
        expand="md"
        style={{
          backgroundColor: "#3e1c66",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* 
          You can also apply display:flex; alignItems:center; on the Container 
          if needed, but typically doing it on the Navbar is enough. 
        */}
        <Container
          fluid
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Logo on the left, aligned center with the nav items */}
          <NavbarBrand href="/" className="d-flex align-items-center" style={{ marginBottom: 0 }}>
            <img
              src={logo}
              alt="App Logo"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                marginRight: "0.75rem",
              }}
            />
          </NavbarBrand>

          <NavbarToggler onClick={toggle} />

          <Collapse isOpen={isOpen} navbar>
            {/* All nav items on the right */}
            <Nav navbar style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
              <NavItem>
                <NavLink
                  tag={RouterNavLink}
                  to="/"
                  exact
                  activeClassName="router-link-exact-active"
                  style={{
                    color: "#f2ede9",
                    fontFamily: "Inter-SemiBold, sans-serif",
                  }}
                >
                  Home
                </NavLink>
              </NavItem>

              {isAuthenticated && (
                <NavItem>
                  <NavLink
                    tag={RouterNavLink}
                    to="/external-api"
                    exact
                    activeClassName="router-link-exact-active"
                    style={{ color: "#f2ede9" }}
                  >
                    External API
                  </NavLink>
                </NavItem>
              )}
              {isAuthenticated && (
                <NavItem>
                  <NavLink
                    tag={RouterNavLink}
                    to="/name-form"
                    exact
                    activeClassName="router-link-exact-active"
                    style={{ color: "#f2ede9" }}
                  >
                    Name Form
                  </NavLink>
                </NavItem>
              )}
              {isAuthenticated && (
                <NavItem>
                  <NavLink
                    tag={RouterNavLink}
                    to="/chart"
                    exact
                    activeClassName="router-link-exact-active"
                    style={{ color: "#f2ede9" }}
                  >
                    Chart
                  </NavLink>
                </NavItem>
              )}
              {isAuthenticated && (
                <NavItem>
                  <NavLink
                    tag={RouterNavLink}
                    to="/dashboard"
                    exact
                    activeClassName="router-link-exact-active"
                    style={{ color: "#f2ede9" }}
                  >
                    Dashboard
                  </NavLink>
                </NavItem>
              )}
              {isAuthenticated && (
                <NavItem>
                  <NavLink
                    tag={RouterNavLink}
                    to="/learning-resources"
                    exact
                    activeClassName="router-link-exact-active"
                    style={{ color: "#f2ede9" }}
                  >
                    Learning Resources
                  </NavLink>
                </NavItem>
              )}

              {!isAuthenticated && (
                <NavItem>
                  <Button
                    id="qsLoginBtn"
                    color="light"
                    outline
                    className="btn-margin"
                    onClick={() => loginWithRedirect()}
                  >
                    Log in
                  </Button>
                </NavItem>
              )}

              {isAuthenticated && (
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="nav-user-profile rounded-circle"
                      width="40"
                    />
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem header>{user.name}</DropdownItem>
                    <DropdownItem
                      tag={RouterNavLink}
                      to="/profile"
                      className="dropdown-profile"
                      activeClassName="router-link-exact-active"
                    >
                      <FontAwesomeIcon icon="user" className="mr-3" /> Profile
                    </DropdownItem>
                    <DropdownItem id="qsLogoutBtn" onClick={logoutWithRedirect}>
                      <FontAwesomeIcon icon="power-off" className="mr-3" /> Log out
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              )}
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default NavBar;
