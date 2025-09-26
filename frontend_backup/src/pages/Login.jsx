import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Alert, Button } from 'antd';
import './Login.css'; // Import the CSS file for styling

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [alert, setAlert] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const validatePassword = (value) => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      setAlert({
        type: 'error',
        message: 'Please fill the form with valid details before submitting',
      });
      setTimeout(() => setAlert({ type: '', message: '' }), 3000);
      return;
    }

    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);

      const userData = await api.get('/auth/profile');
      const role = userData.data.user.role;

      setAlert({ type: 'success', message: 'Login successful!' });
      setTimeout(() => {
        navigate(`/${role}/dashboard`);
      }, 1000);
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Login failed. Please try again.',
      });
      setTimeout(() => setAlert({ type: '', message: '' }), 3000);
    }
  };

  const handleMicrosoftLogin = () => {
    // Placeholder for Microsoft login functionality
    setAlert({ type: 'info', message: 'Microsoft login not implemented yet.' });
    setTimeout(() => setAlert({ type: '', message: '' }), 3000);
  };

  return (
    <div className="login-container">
      {alert.message && (
        <div className="alert-wrapper">
          <Alert message={alert.message} type={alert.type} showIcon />
        </div>
      )}

      

      <div className="login-content">
        <div className="left-section">
          <h1 style={{ fontSize: '3.5rem', fontWeight: 700, textAlign: 'center', marginRight: '30%'}}>
            Welcome 
          </h1>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginRight: '30%', marginTop: '-20px', fontFamily: 'Audiowide'}}>
            LABMate
          </h1>
          <p style={{ textAlign: 'center', marginRight: '30%', marginBottom: '30px'}}>
            Manage all your labs in one place.
          </p>
          <img
            src="../src/assets/login.png"
            alt="Lab Management Illustration"
            className="illustration"
          />
        </div>

        <div className="right-section">
          <div className="nav-links">
            <a href="/student">Student</a>
            <span>|</span>
            <a href="/lecturer">Lecturer</a>
            <span>|</span>
            <a href="/technical-officer">Technical Officer</a>
            <span>|</span>
            <a href="/admin">Admin</a>
          </div>
          <h2>Login</h2>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <input
                type="email"
                placeholder="Username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                className="login-input"
              />
              {emailError && <span className="error">{emailError}</span>}
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                className="login-input"
              />
              {passwordError && <span className="error">{passwordError}</span>}
            </div>

            <Button type="primary" htmlType="submit" className="login-button">
              LOGIN
            </Button>
            <Button
              type="default"
              className="microsoft-login-button"
              onClick={handleMicrosoftLogin}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                alt="Microsoft Logo"
                className="microsoft-logo"
              />
              Log in with Microsoft
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;