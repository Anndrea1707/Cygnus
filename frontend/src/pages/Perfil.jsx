import React from "react";
import { useNavigate } from "react-router-dom";
import "./Perfil.css";

export default function Perfil({ usuario }) {
  const navigate = useNavigate();

  return (
    <div className="perfil-background">
      <h1>Perfil de {usuario?.nombre_completo || "Usuario"}</h1>
      <p><strong>Nombre completo:</strong> {usuario?.nombre_completo || "No especificado"}</p>
      <p><strong>Email:</strong> {usuario?.email || "No especificado"}</p>
      <button onClick={() => navigate("/dashboard")}>Volver al Dashboard</button>
    </div>
  );
}