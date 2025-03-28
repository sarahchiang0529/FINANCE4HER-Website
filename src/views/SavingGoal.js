import React from 'react';

const Header = () => {
  const linkStyle = {
    color: '#FFFFFF',
    fontSize: '20px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    textAlign: 'center',
    padding: '0 15px',
    cursor: 'pointer',
    textDecoration: 'none',
    height: '30px',
    lineHeight: '30px',
    display: 'block',
    transition: 'opacity 0.2s'
  };

  const handleHover = (e) => {
    e.target.style.opacity = '0.8';
  };

  const handleLeave = (e) => {
    e.target.style.opacity = '1';
  };

  return (
    <header style={{
      width: '100%',
      height: '104px',
      backgroundColor: '#65318f',
      padding: '35px 54px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minWidth: '1000px',
      boxSizing: 'border-box'
    }}>
      <img src="https://dashboard.codeparrot.ai/api/image/Z-bfHAz4-w8v6Rf-/logo-sta.png" alt="Logo" style={{ width: '34px', height: '34px', borderRadius: '50%' }} />
      <nav style={{
        display: 'flex',
        gap: '10px',
        height: '30px',
        alignItems: 'center'
      }}>
        <a 
          href="/" 
          style={linkStyle}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
        >
          Home
        </a>
        <a 
          href="/about" 
          style={linkStyle}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
        >
          About
        </a>
        <a 
          href="/signup" 
          style={linkStyle}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
        >
          Sign Up
        </a>
        <a 
          href="/login" 
          style={linkStyle}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
        >
          Login
        </a>
      </nav>
    </header>
  );
};

const Sidebar = ({ style = {} }) => {
  const menuItems = [
    { title: 'Dashboard', path: '/' },
    { title: 'Income & Expenses', path: '/income-expenses' },
    { title: 'Saving Goals', path: '/saving-goals' },
    { title: 'Rewards & Points', path: '/rewards' },
    { title: 'Learning Resources', path: '/learning' },
    { title: 'Settings', path: '/settings' }
  ];

  const sidebarStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#65318f',
    minWidth: '250px',
    height: '100%',
    borderRight: '1px solid #f8cf5f',
    ...style
  };

  const logoStyle = {
    width: '75px',
    height: '75px',
    borderRadius: '50%',
    backgroundColor: '#D9D9D9',
    margin: '12px 0'
  };

  const menuItemStyle = {
    width: '100%',
    height: '62px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontFamily: 'Inter, sans-serif',
    fontSize: '20px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    textAlign: 'center',
    border: 'none',
    background: 'none',
    padding: 0
  };

  const settingsStyle = {
    ...menuItemStyle,
    height: '24px'
  };

  return (
    <div style={sidebarStyle}>
      <div style={logoStyle}>
        <img 
          src="https://dashboard.codeparrot.ai/api/image/Z-bfHAz4-w8v6Rf-/logo-sta.png" 
          alt="Logo" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      {menuItems.map((item, index) => (
        <button
          key={index}
          style={index === menuItems.length - 1 ? settingsStyle : menuItemStyle}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          {item.title}
        </button>
      ))}
    </div>
  );
};

const SavingsGoalCard = ({ title = "Education", currentAmount = 4300, goalAmount = 12000, style }) => {
  // Calculate progress percentage
  const progress = (currentAmount / goalAmount) * 100;
  
  return (
    <div style={{
      backgroundColor: '#d99dd9',
      borderRadius: '10px',
      padding: '20px',
      minWidth: '300px',
      width: '100%',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      ...style
    }}>
      <div style={{
        fontSize: '24px',
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
        marginBottom: '15px',
        color: '#000'
      }}>
        {title}
      </div>
      
      <div style={{
        height: '20px',
        backgroundColor: '#e4d8ed',
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: '#e9d436',
          borderRadius: '20px'
        }}></div>
      </div>

      <div style={{
        textAlign: 'right',
        fontSize: '20px',
        fontFamily: 'Inter, sans-serif',
        color: '#000',
        marginTop: '10px'
      }}>
        ${goalAmount.toLocaleString()}
      </div>
    </div>
  );
};

const AddGoalButton = ({ onClick }) => {
  const buttonStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#65318f',
    border: 'none',
    color: '#dda1d6',
    fontSize: '48px',
    fontFamily: 'Inter, sans-serif',
    lineHeight: '130%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s, background-color 0.2s',
  };

  const hoverStyle = {
    transform: 'scale(1.05)',
    backgroundColor: '#7a3caa',
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button 
      style={{
        ...buttonStyle,
        ...(isHovered ? hoverStyle : {})
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      +
    </button>
  );
};

AddGoalButton.defaultProps = {
  onClick: () => console.log('Add goal button clicked')
};

const SavingGoal = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh', backgroundColor: '#65318f' }}>
      <Header />
      <div style={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar style={{ flexGrow: 0, width: '250px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '20px', gap: '20px' }}>
          <SavingsGoalCard title="Education" currentAmount={4300} goalAmount={12000} />
          <SavingsGoalCard title="Travel & Vacation" currentAmount={5000} goalAmount={25000} />
          <SavingsGoalCard title="Buying a Car" currentAmount={3000} goalAmount={18000} />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px', backgroundColor: '#d99dd9', borderRadius: '10px' }}>
            <AddGoalButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingGoal;
