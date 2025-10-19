import { useEffect } from 'react';
import './SobreNosotros.css';
import logo from '../imagenes/logo.png';
import nosotrosImg from '../imagenes/nosotros.jpg';
import NavbarPrincipal from '../components/NavbarPrincipal';
import Footer from '../components/Footer';


export default function SobreNosotros({ currentPage, onLoginClick, onNavigate }) {
    useEffect(() => {
        const aboutSection = document.getElementById("about-anim");
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => aboutSection.classList.add("animate-about"), 5000);
                }
            });
        }, { threshold: 0.6 });

        observer.observe(aboutSection);
    }, []);

    return (
        <div>
            {/* ===== NAVBAR ===== */}
            <NavbarPrincipal
                currentPage={currentPage}
                onLoginClick={onLoginClick}
                onNavigate={onNavigate}
            />
            {/* ===== SECCIÓN QUIÉNES SOMOS ===== */}
            <section className="about-section">
                {/* ✨ DESTELLOS DECORATIVOS */}
                <img src="https://cdn-icons-png.flaticon.com/128/616/616493.png" alt="destello" className="sparkle sparkle1" />
                <img src="https://cdn-icons-png.flaticon.com/128/616/616493.png" alt="destello" className="sparkle sparkle2" />
                <img src="https://cdn-icons-png.flaticon.com/128/616/616493.png" alt="destello" className="sparkle sparkle3" />
                <img src="https://cdn-icons-png.flaticon.com/128/616/616493.png" alt="destello" className="sparkle sparkle4" />
                <img src="https://cdn-icons-png.flaticon.com/128/616/616493.png" alt="destello" className="sparkle sparkle5" />

                <h2>¿Quiénes somos?</h2>
                <p className="about-intro">
                    Cygnus nace con la visión de transformar la manera en que aprendemos. Nos dimos cuenta de que cada persona tiene su propio ritmo,
                    su forma única de comprender el mundo y de progresar en su aprendizaje. Por eso decidimos crear una plataforma que no enseñe igual
                    para todos, sino que se adapte a ti, a tu tiempo, a tus metas y a tu manera de aprender.

                    <br /><br />
                    Nuestro propósito es integrar la tecnología con la pedagogía moderna, para ofrecer una experiencia de estudio intuitiva,
                    atractiva y verdaderamente personalizada. No se trata solo de aprobar un curso, sino de disfrutar el proceso de aprender.

                    <br /><br />
                    Cygnus representa nuestro compromiso con la educación accesible, innovadora y significativa.
                    Una herramienta creada para estudiantes, profesionales y soñadores que desean seguir creciendo sin límites.

                    <br /><br />
                    Desarrollada desde Bucaramanga, Santander, esta plataforma refleja nuestra pasión por la innovación y
                    nuestro deseo de aportar algo que inspire a las nuevas generaciones a aprender con emoción y propósito.
                </p>

                <div className="about-content">
                    <div className="about-animation-container" id="about-anim">
                        <img src={nosotrosImg} alt="Melissa y Ángel" className="about-moving-image" />

                        <div className="about-text-box">
                            <p>
                                Somos <strong>Melissa</strong> y <strong>Ángel</strong>, estudiantes de las
                                <em> Unidades Tecnológicas de Santander (UTS)</em>, apasionados por el aprendizaje y la tecnología.
                                <br /><br />
                                Creemos que aprender no debe ser un proceso rígido, sino una experiencia personalizada y dinámica.
                                Cygnus nace para romper las barreras del aprendizaje tradicional y convertirlo en algo emocionante, humano y adaptable.
                                <br /><br />
                                Nuestra meta es construir un entorno en el que cada persona tenga el control de su propio ritmo,
                                reciba contenido relevante y descubra que estudiar también puede sentirse inspirador.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <Footer />
        </div>
    );
}
