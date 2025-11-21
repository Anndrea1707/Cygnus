// src/App.jsx - VERSIÓN CORREGIDA CON PRUEBA DE CONOCIMIENTOS
import React, { useState, useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import SobreNosotros from "./pages/SobreNosotros";
import Ayuda from "./pages/Ayuda";
import Dashboard from "./pages/Dashboard";
import CursosPrincipal from "./pages/CursosPrincipal";
import Perfil from "./pages/Perfil";
import Encuesta from "./components/Encuesta";
import PanelAdmin from "./pages/PanelAdmin";
import Biblioteca from "./pages/BibliotecaAdmin";
import ModificarPerfil from "./pages/ModificarPerfil";
import AdminUsuarios from "./pages/AdminUsuarios";
import BibliotecaUsuario from "./pages/Biblioteca";
import UsuariosAdmin from "./pages/UsuariosAdmin";
import AdminPerfil from "./pages/AdminPerfil";
import GestionarAdmins from "./pages/GestionarAdmins";
import CursosAdmin from "./pages/CursosAdmin";
import CrearCursoAdmin from "./pages/CrearCursosAdmin";
import PruebaConocimiento from "./pages/PruebaConocimiento";
import GestionarPruebas from "./pages/GestionarPruebas";
import EditarPrueba from "./pages/EditarPrueba";
import TomarPrueba from "./components/TomarPrueba";
import CursosUsuario from "./pages/CursosUsuario";
import CursoVista from "./pages/CursoVista";


function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [usuario, setUsuario] = useState(null);
  const [pageParams, setPageParams] = useState({});
  const [cargando, setCargando] = useState(true);

  // Verificar usuario al cargar la aplicación
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      try {
        const usuarioData = JSON.parse(usuarioGuardado);
        setUsuario(usuarioData);

        // Si ya está logueado, determinar a dónde debe ir
        determinarPaginaInicial(usuarioData);
      } catch (error) {
        console.error("Error al parsear usuario:", error);
        localStorage.removeItem("usuario");
        setCurrentPage("home");
      }
    }
    setCargando(false);
  }, []);

  const determinarPaginaInicial = (userData) => {
    // 👉 Si es administrador, va directo al panel admin
    if (userData.rol === "admin") {
      setCurrentPage("paneladmin");
      return;
    }

    // 👉 Si NO ha hecho la encuesta
    if (!userData.encuesta_inicial?.completada) {
      setCurrentPage("encuesta");
      return;
    }

    // 👉 Si ya hizo encuesta pero NO ha hecho la prueba
    if (!userData.prueba_conocimiento?.completada) {
      setCurrentPage("prueba-conocimiento");
      return;
    }

    // 👉 Si ya hizo ambas, va al dashboard
    setCurrentPage("dashboard");
  };

  const handleNavigate = (page, params = {}) => {
    setCurrentPage(page);
    setPageParams(params);
  };

  const handleLoginClick = () => setCurrentPage("login");

  const handleLoginSuccess = async (userData) => {
    setUsuario(userData);
    localStorage.setItem("usuario", JSON.stringify(userData));

    // Verificar estado actualizado del usuario (incluyendo prueba de conocimientos)
    try {
      const response = await fetch(`http://localhost:4000/api/pruebas/verificar-estado/${userData._id}`);
      const result = await response.json();

      if (result.success) {
        // Actualizar usuario con información más reciente
        const usuarioActualizado = {
          ...userData,
          encuesta_inicial: {
            ...userData.encuesta_inicial,
            area_interes: result.categoriaInteres
          },
          prueba_conocimiento: {
            completada: result.pruebaCompletada,
            habilidad: result.habilidadActual
          }
        };

        setUsuario(usuarioActualizado);
        localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));

        determinarPaginaInicial(usuarioActualizado);
      } else {
        determinarPaginaInicial(userData);
      }
    } catch (error) {
      console.error("Error al verificar estado:", error);
      determinarPaginaInicial(userData);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    setCurrentPage("home");
  };

  const handleEncuestaCompletada = () => {
    // Después de completar encuesta, mostrar prueba de conocimientos
    setCurrentPage("prueba-conocimiento");
  };

  const handlePruebaCompletada = () => {
    // Después de completar prueba, ir al dashboard
    setCurrentPage("dashboard");

    // Actualizar usuario localmente
    if (usuario) {
      const usuarioActualizado = {
        ...usuario,
        prueba_conocimiento: {
          completada: true,
          fecha_realizacion: new Date().toISOString()
        }
      };
      setUsuario(usuarioActualizado);
      localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
    }
  };

  // Mostrar loading mientras verifica el estado
  if (cargando) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Cargando...
      </div>
    );
  }

  switch (currentPage) {
    case "dashboard":
      return (
        <Dashboard
          usuario={usuario}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          currentPage={currentPage}
        />
      );

    case "perfil":
      return (
        <Perfil
          usuario={usuario}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          currentPage={currentPage}
        />
      );

    case "login":
      return (
        <Login
          onBackToHome={() => setCurrentPage("home")}
          onRegisterClick={() => setCurrentPage("registro")}
          onLoginSuccess={handleLoginSuccess}
          currentPage={currentPage}
        />
      );

    case "registro":
      return (
        <Registro
          onBackToLogin={() => setCurrentPage("login")}
          currentPage={currentPage}
        />
      );

    case "sobreNosotros":
      return (
        <SobreNosotros
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLoginClick={handleLoginClick}
        />
      );

    case "ayuda":
      return (
        <Ayuda
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLoginClick={handleLoginClick}
        />
      );

    case "cursos":
      return (
        <CursosPrincipal
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLoginClick={handleLoginClick}
        />
      );

    case "cursosusuario": // Nueva página para usuarios logueados
      return (
        <CursosUsuario currentPage={currentPage}
          usuario={usuario}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onLoginClick={handleLoginClick}
        />
      );

    case "encuesta":
      return (
        <Encuesta
          usuario={usuario}
          onEncuestaCompletada={handleEncuestaCompletada} // 👈 Cambiado
        />
      );

    // 👇 NUEVA PÁGINA PARA TOMAR LA PRUEBA DE CONOCIMIENTOS
    case "prueba-conocimiento":
      return (
        <TomarPrueba
          usuario={usuario}
          onPruebaCompletada={handlePruebaCompletada}
        />
      );

    case "paneladmin":
      return (
        <PanelAdmin
          usuario={usuario}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      );

    case "modificarPerfil":
      return (
        <ModificarPerfil
          usuario={usuario}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      );

    case "bibliotecaadmin":
      return (
        <Biblioteca
          usuario={usuario}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          currentPage={currentPage}
        />
      );

    case "usuarios":
      return (
        <AdminUsuarios
          usuario={usuario}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          currentPage={currentPage}
        />
      );

    case "biblioteca":
      return (
        <BibliotecaUsuario
          usuario={usuario}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          currentPage={currentPage}
        />
      );

    case "adminusuarios":
      return (
        <UsuariosAdmin
          usuario={usuario}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          currentPage={currentPage}
        />
      );

    case "adminperfil":
      return (
        <AdminPerfil
          usuario={usuario}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      );

    case "gestionarAdmins":
      return (
        <GestionarAdmins
          usuario={usuario}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          currentPage={currentPage}
        />
      );

    case "cursosadmin":
      return (
        <CursosAdmin
          usuario={usuario}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          currentPage={currentPage}
        />
      );
    case "curso-vista":
      return (
        <CursoVista
          currentPage={currentPage}
          usuario={usuario}
          onNavigate={handleNavigate}
          curso={pageParams.curso}
        />
      );


    case "crearcursosadmin":
      return (
        <CrearCursoAdmin
          usuario={usuario}
          onNavigate={handleNavigate}
          cursoEditar={pageParams}
          onLogout={handleLogout}
          currentPage={currentPage}
        />
      );


    case "crearprueba":
      return (
        <PruebaConocimiento
          onNavigate={handleNavigate}
          categoriaPreSeleccionada={pageParams.categoriaPreSeleccionada}
        />
      );

    case "gestionarpruebas":
      return (
        <GestionarPruebas
          onNavigate={handleNavigate}
        />
      );

    case "editarprueba":
      return (
        <EditarPrueba
          onNavigate={handleNavigate}
          pruebaId={pageParams.pruebaId}
        />
      );

    default:
      return (
        <Home
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLoginClick={handleLoginClick}
        />
      );
  }
}

export default App;