"use client"

import { useState } from "react"
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react"
import Loading from "../components/Loading"
import { Mail, User, Edit, AlertCircle, Key } from "lucide-react"
import "../stylesheets/Profile.css"
import authConfig from "../auth_config.json"

export const ProfileComponent = () => {
  const { user, getAccessTokenSilently, logout } = useAuth0()
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState(null)
  const [newEmail, setNewEmail] = useState("")
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [emailChangeError, setEmailChangeError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Start editing profile
  const startEditing = () => {
    setEditedUser({
      given_name: user.given_name || "",
      family_name: user.family_name || "",
      nickname: user.nickname || "",
    })
    setNewEmail(user.email || "")
    setIsEditing(true)
    setEmailChangeError("")
  }

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false)
    setEditedUser(null)
    setNewEmail("")
    setIsChangingEmail(false)
    setEmailChangeError("")
  }

  // Toggle email change form
  const toggleEmailChange = () => {
    setIsChangingEmail(!isChangingEmail)
    setEmailChangeError("")
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle email input change
  const handleEmailChange = (e) => {
    setNewEmail(e.target.value)
    setEmailChangeError("")
  }

  // Save edited profile
  const saveProfile = async () => {
    setIsLoading(true)
    try {
      // Get the user's ID token for authentication
      const token = await getAccessTokenSilently()

      // Update profile information
      const profileResponse = await fetch("/api/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.sub,
          given_name: editedUser.given_name,
          family_name: editedUser.family_name,
          nickname: editedUser.nickname,
        }),
      })

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json()
        throw new Error(errorData.message || "Failed to update profile")
      }

      // If email is being changed and is different from current email
      if (isChangingEmail && newEmail !== user.email) {
        const emailResponse = await fetch("/api/change-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: user.sub,
            email: newEmail,
          }),
        })

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json()
          throw new Error(errorData.message || "Failed to update email")
        }

        alert("Email change initiated! Please check your new email inbox for verification.")
        // Log the user out so they can log back in with the new email after verification
        setTimeout(() => {
          logout({ returnTo: window.location.origin })
        }, 3000)
      } else {
        alert("Profile updated successfully!")
        // Refresh the page to get updated user info
        window.location.reload()
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setEmailChangeError(error.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle password change request
  const handlePasswordChange = () => {
    // Redirect to Auth0's change password page
    window.location.href = `https://${authConfig.domain}/authorize?client_id=${authConfig.clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      window.location.origin,
    )}&scope=openid%20profile%20email&state=PASSWORD_RESET`
  }

  return (
    <div className="profile-container">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">View and manage your account information</p>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <img src={user.picture || "/placeholder.svg"} alt="Profile" className="profile-image" />
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user.name}</h2>
            <p className="profile-email">{user.email}</p>
          </div>
          {!isEditing && (
            <button className="edit-profile-button" onClick={startEditing}>
              <Edit size={18} />
              Edit Profile
            </button>
          )}
        </div>

        <div className="profile-details">
          <h3 className="details-title">Account Details</h3>

          {isEditing ? (
            <div className="edit-profile-form">
              <div className="form-group">
                <div className="input-field">
                  <label htmlFor="given_name">First Name</label>
                  <input
                    type="text"
                    id="given_name"
                    name="given_name"
                    value={editedUser.given_name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="input-field">
                  <label htmlFor="family_name">Last Name</label>
                  <input
                    type="text"
                    id="family_name"
                    name="family_name"
                    value={editedUser.family_name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="input-field">
                  <label htmlFor="nickname">Nickname</label>
                  <input
                    type="text"
                    id="nickname"
                    name="nickname"
                    value={editedUser.nickname}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="input-field">
                  <div className="email-field-header">
                    <label htmlFor="email">Email</label>
                    <button type="button" className="change-email-button" onClick={toggleEmailChange}>
                      {isChangingEmail ? "Cancel Email Change" : "Change Email"}
                    </button>
                  </div>

                  {isChangingEmail ? (
                    <div className="email-change-container">
                      <input
                        type="email"
                        id="new_email"
                        name="new_email"
                        value={newEmail}
                        onChange={handleEmailChange}
                        placeholder="Enter new email address"
                      />
                      {emailChangeError && (
                        <div className="error-message">
                          <AlertCircle size={16} />
                          {emailChangeError}
                        </div>
                      )}
                      <p className="field-note">
                        You'll need to verify your new email address before the change takes effect.
                      </p>
                    </div>
                  ) : (
                    <input type="email" id="email" name="email" value={user.email} disabled />
                  )}
                </div>

                <div className="password-change-section">
                  <button type="button" className="change-password-button" onClick={handlePasswordChange}>
                    <Key size={16} />
                    Change Password
                  </button>
                </div>

                <div className="edit-actions">
                  <button className="btn-secondary" onClick={cancelEditing} disabled={isLoading}>
                    Discard Changes
                  </button>
                  <button className="btn-primary" onClick={saveProfile} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="details-grid">
              <div className="detail-item">
                <div className="detail-icon">
                  <User size={20} />
                </div>
                <div className="detail-content">
                  <h4 className="detail-label">First Name</h4>
                  <p className="detail-value">{user.given_name || "N/A"}</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <User size={20} />
                </div>
                <div className="detail-content">
                  <h4 className="detail-label">Last Name</h4>
                  <p className="detail-value">{user.family_name || "N/A"}</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <User size={20} />
                </div>
                <div className="detail-content">
                  <h4 className="detail-label">Nickname</h4>
                  <p className="detail-value">{user.nickname || "N/A"}</p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">
                  <Mail size={20} />
                </div>
                <div className="detail-content">
                  <h4 className="detail-label">Email</h4>
                  <p className="detail-value">{user.email || "N/A"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default withAuthenticationRequired(ProfileComponent, {
  onRedirecting: () => <Loading />,
})