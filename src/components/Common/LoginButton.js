import React from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Button } from "reactstrap"

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0()
  return (
    <Button id="qsLoginBtn" color="light" outline onClick={() => loginWithRedirect()}>
      Log in
    </Button>
  )
}

export default LoginButton