// src/App.jsx
import React, { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro'; 

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'login', 'registro'

  return (
    <>
      {currentPage === 'home' ? (
        <Home onLoginClick={() => setCurrentPage('login')} />
      ) : currentPage === 'login' ? (
        <Login 
          onBackToHome={() => setCurrentPage('home')} 
          onRegisterClick={() => setCurrentPage('registro')} // ✅ Nueva función
        />
      ) : (
        <Registro onBackToLogin={() => setCurrentPage('login')} />
      )}
    </>
  );
}

export default App;