const express = require("express");
const router = express.Router();
const Usuario = require("./Usuario"); // tu modelo correcto

// 🔢 Obtener total de usuarios (excluye al admin)
router.get("/", async (req, res) => {
  try {
    const totalUsuarios = await Usuario.countDocuments({
      correo: { $ne: "admin@cygnus.com" } // excluye admin
    });

    res.json({ total: totalUsuarios });
  } catch (error) {
    console.error("❌ Error al contar usuarios:", error);
    res.status(500).json({
      mensaje: "Error al obtener el conteo de usuarios"
    });
  }
});

module.exports = router;
