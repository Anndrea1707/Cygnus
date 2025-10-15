import React from 'react';
import './Home.css';
import cube from '../imagenes/CuboPrincipal.png';
import logo from '../imagenes/logo.png';

export default function Home() {
  return (
    <section className="home-container">
      <nav className="navbar">
        <div className="logo-section">
          <img src={logo} alt="Logo Cygnus" className="logo-img" />
          <span className="logo-text">CYGNUS</span>
        </div>

        <ul className="nav-links">
          <li><a href="#inicio" className="active">Inicio</a></li>
          <li><a href="#cursos">Cursos</a></li>
          <li><a href="#nosotros">Sobre nosotros</a></li>
        </ul>

        <button className="btn-login">Iniciar Sesión</button>
      </nav>

      <div className="hero">
        <div className="hero-text">
          <h1>Aprendizaje adaptativo a tu medida.</h1>
          <p>
            Cygnus ajusta los contenidos según tu forma de aprender, potenciando tu autonomía y tus resultados.
          </p>
          <button className="btn-primary">Comenzar ahora</button>
        </div>

        <div className="hero-image">
          <img src={cube} alt="Cubo Cygnus" />
        </div>
      </div>
    </section>
  );
}
