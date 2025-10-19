// src/App.jsx
import React, { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import SobreNosotros from './pages/SobreNosotros';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // Control de navegación

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleLoginClick = () => {
    setCurrentPage('login');
  };

  return (
    <>
      {currentPage === 'home' && (
        <Home
          currentPage={currentPage}
          onLoginClick={handleLoginClick}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'login' && (
        <Login
          onBackToHome={() => setCurrentPage('home')}
          onRegisterClick={() => setCurrentPage('registro')}
        />
      )}

      {currentPage === 'registro' && (
        <Registro onBackToLogin={() => setCurrentPage('login')} />
      )}

      {currentPage === 'sobreNosotros' && (
        <SobreNosotros
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLoginClick={handleLoginClick}
        />
      )}
    </>
  );
}

export default App;
