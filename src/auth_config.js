import authConfig from "./auth_config.json"

export const auth0Config = {
  ...authConfig,
  audience: `https://${authConfig.domain}/api/v2/`,
  scope: "openid profile email update:current_user_metadata update:users",
}

export default auth0Config