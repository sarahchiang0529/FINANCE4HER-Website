import React, { useState } from "react";
import "../stylesheets/NameForm.css"; // Import the CSS file for styling

const NameForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("First Name:", firstName);
    console.log("Last Name:", lastName);
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="name-form">
        <div className="form-group">
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="form-control"
          />
        </div>
        <button type="submit" className="btn-submit">Submit</button>
      </form>
    </div>
  );
};

export default NameForm;
