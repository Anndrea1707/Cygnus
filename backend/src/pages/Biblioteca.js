const express = require("express");
const router = express.Router();

const recursos = [
  {
    _id: "1",
    titulo: "Introducción a fracciones",
    descripcion: "Documento PDF básico para aprender fracciones.",
    tipo: "documento",
    url: "https://res.cloudinary.com/tuCuenta/documento1.pdf"
  },
  {
    _id: "2",
    titulo: "Reglas de acentuación",
    descripcion: "Imagen explicativa con ejemplos.",
    tipo: "imagen",
    url: "https://res.cloudinary.com/tuCuenta/imagen2.png"
  }
];

router.get("/", (req, res) => {
  res.json(recursos);
});

module.exports = router;
