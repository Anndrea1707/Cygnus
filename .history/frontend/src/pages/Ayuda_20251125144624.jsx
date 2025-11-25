import './Ayuda.css';
import { useState } from 'react';
import NavbarPrincipal from '../components/NavbarPrincipal';
import Footer from '../components/Footer';
import { ChevronDown } from 'lucide-react';
import emailjs from "@emailjs/browser";

export default function Ayuda({ currentPage, onNavigate, onLoginClick }) {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    tipo: 'Petición',
    mensaje: ''
  });

  const [activeIndex, setActiveIndex] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' }); // ✅ agregado

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.nombre.trim() ||
      !formData.correo.trim() ||
      !formData.tipo.trim() ||
      !formData.mensaje.trim()
    ) {
      setStatus({
        type: 'error',
        message: 'Por favor completa todos los campos antes de enviar.'
      });
      return;
    }

    emailjs
      .send(
        "service_ta6ombs", // ✅ tu Service ID
        "template_xy3jsvh", // ✅ tu Template ID
        formData,           // datos del formulario
        "L1Myi6rqL0xde57_I" // ✅ tu Public Key
      )
      .then(
        () => {
          setStatus({
            type: 'success',
            message:
              'Tu solicitud ha sido enviada correctamente. ¡Gracias por contactarnos!'
          });
          setFormData({
            nombre: '',
            correo: '',
            tipo: 'Petición',
            mensaje: ''
          });

          // Oculta mensaje después de 4 segundos
          setTimeout(() => setStatus({ type: '', message: '' }), 4000);
        },
        () => {
          setStatus({
            type: 'error',
            message:
              'Ocurrió un error al enviar tu solicitud. Intenta nuevamente.'
          });
        }
      );
  };

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      pregunta: '¿Por qué el enfoque inicial en matemáticas?',
      respuesta:
        'Las matemáticas fueron seleccionadas como nuestro piloto porque:', 
        'Son una de las áreas con mayores dificultades de aprendizaje Desarrollan pensamiento lógico fundamental para otras disciplinas',
        'Permiten medir el progreso con precisión para refinar nuestros algoritmos

Nos permiten garantizar calidad antes de expandirnos

Esta estrategia nos asegura crear una base sólida antes de convertirnos en la plataforma educativa integral que visualizamos.'
    },
    {
      pregunta: '¿Cómo funciona la adaptación del contenido?',
      respuesta:
        'La plataforma analiza tu progreso y ajusta la dificultad de las actividades de forma automática. Si respondes correctamente varias veces, los ejercicios se vuelven un poco más desafiantes; si presentas dificultad, el sistema te muestra ejemplos más guiados. Además, el sistema también considera cuándo fue la última vez que estudiaste un tema, para decidir el mejor momento de recordarlo o reforzarlo. De esta forma, el aprendizaje se mantiene equilibrado entre nuevos retos y repasos oportunos.'
    },
    {
      pregunta: '¿Qué modelos matemáticos utiliza la plataforma?',
      respuesta:
        'Cygnus usa dos modelos sencillos para personalizar tu experiencia. El primero ajusta la dificultad de las preguntas según tu nivel actual, permitiendo que el contenido se mantenga desafiante pero alcanzable. El segundo tiene en cuenta el tiempo desde que viste cada tema, para determinar cuándo volver a mostrarlo y ayudarte a recordar lo aprendido. Al combinar ambos, la plataforma logra un aprendizaje más constante y efectivo, adaptado a tu ritmo y memoria.'
    },
    {
      pregunta: '¿Cómo puedo registrarme o iniciar sesión?',
      respuesta:
        'Desde la página principal, selecciona “Registrarse” si aún no tienes una cuenta o “Iniciar sesión” si ya estás registrado. Solo necesitas un correo electrónico y una contraseña segura.'
    },
    {
      pregunta: '¿Qué son las copas y cómo funcionan?',
      respuesta:
        'Las copas son recompensas visuales que obtienes al completar un curso completo. Cada categoría tiene su propia copa, y al reunir varias, podrás desbloquear contenido especial o insignias dentro de tu perfil.'
    },
    {
      pregunta: '¿Puedo seguir aprendiendo sin conexión?',
      respuesta:
        'Por el momento no, pero estamos desarrollando una versión offline que te permitirá descargar módulos para continuar tu progreso sin conexión a internet.'
    }
  ];

  return (
    <div className="ayuda-page">
      <NavbarPrincipal
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLoginClick={onLoginClick}
      />

      <section className="faq-section">
        <h2>Preguntas Frecuentes</h2>
        <div className="faq-grid">
          {faqs.map((item, index) => (
            <div
              key={index}
              className={`faq-item ${activeIndex === index ? 'active' : ''}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-question">
                <h3>{item.pregunta}</h3>
                <ChevronDown
                  className={`icon ${activeIndex === index ? 'rotate' : ''}`}
                />
              </div>
              <div
                className="faq-answer"
                style={{
                  maxHeight: activeIndex === index ? '300px' : '0px'
                }}
              >
                <p>{item.respuesta}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pqrs-section">
        <h2>Formulario PQRS</h2>
        <form onSubmit={handleSubmit} className="pqrs-form">
          <div className="form-group">
            <label>Nombre completo</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Tipo de solicitud</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una opción</option>
              <option value="Petición">Petición</option>
              <option value="Queja">Queja</option>
              <option value="Reclamo">Reclamo</option>
              <option value="Sugerencia">Sugerencia</option>
            </select>
          </div>

          <div className="form-group">
            <label>Mensaje</label>
            <textarea
              name="mensaje"
              rows="5"
              value={formData.mensaje}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn-enviar"
            disabled={
              !formData.nombre.trim() ||
              !formData.correo.trim() ||
              !formData.tipo.trim() ||
              !formData.mensaje.trim()
            }
          >
            Enviar
          </button>

          {/* ✅ Mensaje visual animado */}
          {status.message && (
            <div className={`form-status ${status.type}`}>
              {status.message}
            </div>
          )}
        </form>
      </section>

      <Footer />
    </div>
  );
}
