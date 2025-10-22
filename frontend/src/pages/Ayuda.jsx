import './Ayuda.css';
import { useState } from 'react';
import NavbarPrincipal from '../components/NavbarPrincipal';
import Footer from '../components/Footer';

export default function Ayuda({ currentPage, onNavigate, onLoginClick }) {
  const [formData, setFormData] = useState({ nombre: '', correo: '', tipo: 'Petición', mensaje: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Tu solicitud ha sido enviada correctamente. ¡Gracias por contactarnos!');
    setFormData({ nombre: '', correo: '', tipo: 'Petición', mensaje: '' });
  };

  return (
    <div className="ayuda-page">
      <NavbarPrincipal currentPage={currentPage} onNavigate={onNavigate} onLoginClick={onLoginClick} />

      <section className="faq-section">
        <h2>Preguntas Frecuentes</h2>
        <div className="faq-item">
          <h3>¿Qué es Cygnus?</h3>
          <p>Cygnus es una plataforma de aprendizaje adaptativo que ajusta el contenido y la dificultad de acuerdo con tu progreso y ritmo personal.</p>
        </div>
        <div className="faq-item">
          <h3>¿Debo pagar para usar Cygnus?</h3>
          <p>No, el uso básico de Cygnus es completamente gratuito. Algunos módulos avanzados podrían requerir suscripción más adelante.</p>
        </div>
        <div className="faq-item">
          <h3>¿Puedo acceder desde mi celular?</h3>
          <p>Sí, la plataforma es totalmente compatible con dispositivos móviles y tablets.</p>
        </div>
        <div className="faq-item">
          <h3>¿Qué hago si tengo un problema con mi cuenta?</h3>
          <p>Puedes escribirnos a través del siguiente formulario PQRS o al correo <strong>soporte@cygnus.com</strong>.</p>
        </div>
      </section>

      <section className="pqrs-section">
        <h2>Formulario PQRS</h2>
        <form onSubmit={handleSubmit} className="pqrs-form">
          <label>Nombre completo</label>
          <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />

          <label>Correo electrónico</label>
          <input type="email" name="correo" value={formData.correo} onChange={handleChange} required />

          <label>Tipo de solicitud</label>
          <select name="tipo" value={formData.tipo} onChange={handleChange}>
            <option>Petición</option>
            <option>Queja</option>
            <option>Reclamo</option>
            <option>Sugerencia</option>
          </select>

          <label>Mensaje</label>
          <textarea name="mensaje" rows="5" value={formData.mensaje} onChange={handleChange} required></textarea>

          <button type="submit">Enviar</button>
        </form>
      </section>

      <Footer />
    </div>
  );
}
