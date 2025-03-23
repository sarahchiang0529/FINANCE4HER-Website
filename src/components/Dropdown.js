import React from 'react';

const Dropdown = ({ value, onChange, options }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#E9D436',
        border: '1px solid #E9D436',
        borderRadius: '5px',
        padding: '5px',
        outline: 'none',
        backdropFilter: 'blur(10px)',
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        cursor: 'pointer',
      }}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option} &#x25BC;
        </option>
      ))}
    </select>
  );
};

export default Dropdown;
