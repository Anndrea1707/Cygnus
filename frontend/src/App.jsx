// src/App.jsx
import React, { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <>
      {currentPage === 'home' ? (
        <Home onLoginClick={() => setCurrentPage('login')} />
      ) : (
        <Login onBackToHome={() => setCurrentPage('home')} />
      )}
    </>
  );
}

export default App;