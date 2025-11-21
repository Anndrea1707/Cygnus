// src/App.jsx - VERSIÓN CORREGIDA CON NAVEGACIÓN ENTRE MÓDULOS
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
import CursoContenido from "./pages/CursoContenido";
import EvaluacionModulo from "./pages/EvaluacionModulo";
import EvaluacionFinal from "./pages/EvaluacionFinal";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [usuario, setUsuario] = useState(null);
  const [pageParams, setPageParams] = useState({});
  const [cargando, setCargando] = useState(true);
  const [cursoProgreso, setCursoProgreso] = useState({});

  // Verificar usuario al cargar la aplicación
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    const progresoGuardado = localStorage.getItem("cursoProgreso");

    if (usuarioGuardado) {
      try {
        const usuarioData = JSON.parse(usuarioGuardado);
        setUsuario(usuarioData);
        determinarPaginaInicial(usuarioData);
      } catch (error) {
        console.error("Error al parsear usuario:", error);
        localStorage.removeItem("usuario");
        setCurrentPage("home");
      }
    }

    if (progresoGuardado) {
      try {
        setCursoProgreso(JSON.parse(progresoGuardado));
      } catch (error) {
        console.error("Error al parsear progreso:", error);
      }
    }

    setCargando(false);
  }, []);

  const determinarPaginaInicial = (userData) => {
    if (userData.rol === "admin") {
      setCurrentPage("paneladmin");
      return;
    }

    if (!userData.encuesta_inicial?.completada) {
      setCurrentPage("encuesta");
      return;
    }

    if (!userData.prueba_conocimiento?.completada) {
      setCurrentPage("prueba-conocimiento");
      return;
    }

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

    try {
      const response = await fetch(`http://localhost:4000/api/pruebas/verificar-estado/${userData._id}`);
      const result = await response.json();

      if (result.success) {
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
    setCurrentPage("prueba-conocimiento");
  };

  const handlePruebaCompletada = () => {
    setCurrentPage("dashboard");
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

  // ✅ NUEVA FUNCIÓN: Manejar evaluación completada de módulo
  const handleEvaluacionModuloCompletada = (moduloIndexCompletado) => {
    const { curso } = pageParams;
    const siguienteModuloIndex = moduloIndexCompletado + 1;

    // Actualizar progreso
    const nuevoProgreso = {
      ...cursoProgreso,
      [curso.id]: {
        ...cursoProgreso[curso.id],
        moduloActual: siguienteModuloIndex,
        contenidoActual: 0,
        modulosCompletados: [
          ...(cursoProgreso[curso.id]?.modulosCompletados || []),
          moduloIndexCompletado
        ]
      }
    };

    setCursoProgreso(nuevoProgreso);
    localStorage.setItem("cursoProgreso", JSON.stringify(nuevoProgreso));

    // Verificar si hay más módulos
    if (siguienteModuloIndex < curso.modulos.length) {
      // Navegar al siguiente módulo
      handleNavigate("curso-contenido", {
        curso: curso,
        moduloIndex: siguienteModuloIndex,
        contenidoIndex: 0
      });
    } else {
      // Es el último módulo, mostrar modal de evaluación final
      handleNavigate("curso-contenido", {
        curso: curso,
        moduloIndex: moduloIndexCompletado, // Mantener en el último módulo completado
        contenidoIndex: curso.modulos[moduloIndexCompletado].contenido.length - 1
      });
    }
  };

  // ✅ NUEVA FUNCIÓN: Manejar finalización de curso
  const handleFinalizarCurso = () => {
    const { curso } = pageParams;

    // Marcar curso como completado
    const nuevoProgreso = {
      ...cursoProgreso,
      [curso.id]: {
        ...cursoProgreso[curso.id],
        completado: true,
        fechaCompletado: new Date().toISOString()
      }
    };

    setCursoProgreso(nuevoProgreso);
    localStorage.setItem("cursoProgreso", JSON.stringify(nuevoProgreso));

    // Navegar a la vista de cursos del usuario
    handleNavigate("cursosusuario");
  };

  // ✅ NUEVA FUNCIÓN: Manejar evaluación final completada
  const handleEvaluacionFinalCompletada = () => {
    const { curso } = pageParams;

    // Marcar evaluación final como completada
    const nuevoProgreso = {
      ...cursoProgreso,
      [curso.id]: {
        ...cursoProgreso[curso.id],
        evaluacionFinalCompletada: true,
        fechaEvaluacionFinal: new Date().toISOString(),
        completado: true
      }
    };

    setCursoProgreso(nuevoProgreso);
    localStorage.setItem("cursoProgreso", JSON.stringify(nuevoProgreso));

    // Navegar a la vista de cursos del usuario
    handleNavigate("cursosusuario");
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

    case "cursosusuario":
      return (
        <CursosUsuario
          currentPage={currentPage}
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
          onEncuestaCompletada={handleEncuestaCompletada}
        />
      );

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
          progreso={cursoProgreso[pageParams.curso?.id]}
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

    // ✅ CASOS CORREGIDOS: Navegación entre módulos y evaluaciones
    case "curso-contenido":
      return (
        <CursoContenido
          curso={pageParams.curso}
          moduloIndex={pageParams.moduloIndex || 0}
          contenidoIndex={pageParams.contenidoIndex || 0}
          onNavigate={handleNavigate}
          onFinalizarCurso={handleFinalizarCurso}
        />
      );

    case "evaluacion-modulo":
      return (
        <EvaluacionModulo
          curso={pageParams.curso}
          modulo={pageParams.modulo}
          moduloIndex={pageParams.moduloIndex}
          onNavigate={handleNavigate}
          onEvaluacionCompletada={handleEvaluacionModuloCompletada}
        />
      );

    case "evaluacion-final":
      return (
        <EvaluacionFinal
          curso={pageParams.curso}
          evaluacion={pageParams.evaluacion}
          onNavigate={handleNavigate}
          onEvaluacionCompletada={handleEvaluacionFinalCompletada}
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