require('dotenv').config();

const express = require('express');

const mongoose = require('mongoose');

const cors = require('cors');



const app = express();

app.use(cors());

app.use(express.json());



// ✅ Conexión a MongoDB

mongoose.connect(process.env.MONGO_URI)

  .then(() => console.log('✅ Conectado a MongoDB'))

  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));



// ✅ Ruta de prueba

app.get('/', (req, res) => {

  res.send('Servidor Cygnus funcionando 🚀');

});



// ✅ Puerto

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log('Servidor corriendo en http://localhost:${PORT}'));