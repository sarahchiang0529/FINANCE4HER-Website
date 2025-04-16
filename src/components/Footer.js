import { Container, Navbar } from "reactstrap"
import "../stylesheets/Footer.css"

const Footer = () => {
  return (
    <div className="footer-wrapper">
      <Navbar dark className="custom-navbar footer-navbar">
        <Container fluid className="navbar-container">
          <span className="footer__copy">&copy; 2024 EmpowHERto.org, All Rights Reserved.</span>
        </Container>
      </Navbar>
    </div>
  )
}

export default Footer
