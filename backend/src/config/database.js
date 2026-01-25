const mongoose = require('mongoose');

/**
 * Configuración y conexión a MongoDB
 * 
 * MongoDB es una base de datos NoSQL que almacena datos en formato JSON
 * Mongoose es una librería que facilita trabajar con MongoDB en Node.js
 */

const connectDB = async () => {
  try {
    // Conectar a MongoDB (sin opciones deprecadas)
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    console.log(`📦 Base de datos: ${conn.connection.name}`);

    // Eventos de la conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB desconectado');
    });

    // Manejar cierre de aplicación
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB desconectado por cierre de aplicación');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error al conectar MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;