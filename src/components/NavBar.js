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
import logo from "../assets/logo1.png"; // Example: your uploaded logo

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
      {/* Dark variant helps ensure toggler and text can be white */}
      <Navbar style={{ backgroundColor: "#65318f" }} dark expand="md">
        {/* 
          Use fluid if you want the container to stretch the full width,
          or remove 'fluid' to use the default fixed-width container 
        */}
        <Container fluid>
          {/* Logo on the left */}
          <NavbarBrand href="/" className="d-flex align-items-center">
            {/* Adjust size as needed */}
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
            {/* Left side links */}
            <Nav navbar className="me-auto">
              <NavItem>
                <NavLink
                  tag={RouterNavLink}
                  to="/"
                  exact
                  activeClassName="router-link-exact-active"
                  style={{ color: "#fff", fontFamily: "Inter-SemiBold, sans-serif" }}
                >
                  Home
                </NavLink>
              </NavItem>

              {isAuthenticated && (
                <>
                  <NavItem>
                    <NavLink
                      tag={RouterNavLink}
                      to="/external-api"
                      exact
                      activeClassName="router-link-exact-active"
                      style={{ color: "#fff", fontFamily: "Inter-SemiBold, sans-serif" }}
                    >
                      External API
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      tag={RouterNavLink}
                      to="/learning-resources"
                      exact
                      activeClassName="router-link-exact-active"
                      style={{ color: "#fff", fontFamily: "Inter-SemiBold, sans-serif" }}
                    >
                      Learning Resources
                    </NavLink>
                  </NavItem>
                </>
              )}
            </Nav>

            {/* Right side: Login or Profile */}
            <Nav navbar className="ms-auto">
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
