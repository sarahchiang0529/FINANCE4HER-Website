"use client"

import React, { useState } from "react"
import { NavLink as RouterNavLink, useLocation } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap"
import { useAuth0 } from "@auth0/auth0-react"
import LoginButton from "./LoginButton"
import logo from "../assets/logos/logo1.png"
import "../stylesheets/NavBar.css"

const NavBar = () => {
  const location = useLocation()
  const isSelectedPage = location.pathname !== "/"
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth0()

  const toggle = () => setIsOpen(!isOpen)
  const logoutWithRedirect = () =>
    logout({ logoutParams: { returnTo: window.location.origin } })

  const renderNavLink = (to, label) => (
    <NavItem>
      <NavLink
        tag={RouterNavLink}
        to={to}
        exact
        activeClassName="active-link"
        className="nav-link"
      >
        {label}
      </NavLink>
    </NavItem>
  )

  return (
    <div className="nav-container">
      <Navbar
        dark
        expand="md"
        className={`custom-navbar ${isSelectedPage ? "custom-navbar--white" : ""}`}
      >
        <Container fluid className="navbar-container">
          <NavbarBrand href="/" className="navbar-brand">
            <img src={logo} alt="App Logo" className="navbar-logo" />
          </NavbarBrand>
          <NavbarToggler onClick={toggle} />
          <Collapse isOpen={isOpen} navbar>
            <Nav navbar className="nav-links">
              {renderNavLink("/", "Home")}

              {isAuthenticated && (
                <>
                  {renderNavLink("/dashboard", "Dashboard")}
                  {renderNavLink("/income", "Income")}
                  {renderNavLink("/expenses", "Expenses")}
                  {renderNavLink("/saving-goals", "Saving Goals")}
                  {renderNavLink("/learning-resources", "Learning Resources")}
                  {renderNavLink("/points-rewards", "Points & Rewards")}

                </>
              )}

              {!isAuthenticated && (
                <NavItem>
                  <LoginButton />
                </NavItem>
              )}

              {isAuthenticated && (
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav>
                    <div className="dropdown-profile">
                      <img
                        src={user.picture}
                        alt="Profile"
                        className="nav-user-profile rounded-circle"
                        width="40"
                      />
                      <div className="caret-triangle" />
                    </div>
                  </DropdownToggle>
                  <DropdownMenu end>
                    <DropdownItem header>{user.name}</DropdownItem>
                    <DropdownItem
                      tag={RouterNavLink}
                      to="/profile"
                      exact
                      activeClassName="active-link"
                      className="nav-link"
                    >
                      <FontAwesomeIcon icon="user" className="me-2" /> Profile
                    </DropdownItem>
                    <DropdownItem id="qsLogoutBtn" onClick={logoutWithRedirect}>
                      <FontAwesomeIcon icon="power-off" className="me-2" /> Log out
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              )}
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </div>
  )
}

export default NavBar