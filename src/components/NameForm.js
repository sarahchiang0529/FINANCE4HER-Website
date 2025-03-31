import React, { useState } from "react";

const NameForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("First Name:", firstName);
    console.log("Last Name:", lastName);
  };

  return (
    <div className="name-form-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#65318F', padding: '20px' }}>
      <div className="form-box" style={{ width: '100%', maxWidth: '400px', backgroundColor: '#502a6e', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ marginBottom: '20px', color: '#FFFFFF', textAlign: 'center' }}>Enter Your Name</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className="form-group">
            <label htmlFor="firstName" style={{ color: '#E9D436', fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>First Name:</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #E9D436',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#E9D436',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName" style={{ color: '#E9D436', fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Last Name:</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #E9D436',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#E9D436',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: '#E9D436',
              color: '#65318F',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default NameForm;
