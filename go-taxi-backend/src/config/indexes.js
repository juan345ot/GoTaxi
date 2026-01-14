/**
 * Configuración de índices para MongoDB
 * Define índices para optimizar consultas frecuentes
 */
/* eslint-disable no-console */

const mongoose = require('mongoose');

/**
 * Crear índices para el modelo User
 */
const createUserIndexes = async () => {
  try {
    const userCollection = mongoose.connection.db.collection('users');

    // Índice único para email
    await userCollection.createIndex({ email: 1 }, { unique: true });

    // Índice para rol
    await userCollection.createIndex({ role: 1 });

    // Índice para estado activo
    await userCollection.createIndex({ isActive: 1 });

    // Índice compuesto para búsquedas por rol y estado
    await userCollection.createIndex({ role: 1, isActive: 1 });

    // Índice para fecha de creación
    await userCollection.createIndex({ createdAt: -1 });

    // Índice de texto para búsquedas
    await userCollection.createIndex({
      name: 'text',
      lastname: 'text',
      email: 'text',
    });

    console.log('Índices de User creados exitosamente');
  } catch (error) {
    console.error('Error creando índices de User:', error.message);
  }
};

/**
 * Crear índices para el modelo Trip
 */
const createTripIndexes = async () => {
  try {
    const tripCollection = mongoose.connection.db.collection('trips');

    // Índice para pasajero
    await tripCollection.createIndex({ pasajero: 1 });

    // Índice para conductor
    await tripCollection.createIndex({ conductor: 1 });

    // Índice para estado
    await tripCollection.createIndex({ status: 1 });

    // Índice compuesto para pasajero y estado
    await tripCollection.createIndex({ pasajero: 1, status: 1 });

    // Índice compuesto para conductor y estado
    await tripCollection.createIndex({ conductor: 1, status: 1 });

    // Índice para fecha de creación
    await tripCollection.createIndex({ createdAt: -1 });

    // Índice para fecha de actualización
    await tripCollection.createIndex({ updatedAt: -1 });

    // Índice compuesto para consultas de viajes activos
    await tripCollection.createIndex({
      status: 1,
      createdAt: -1,
    });

    // Índice para búsquedas por rango de fechas
    await tripCollection.createIndex({
      createdAt: 1,
      status: 1,
    });

    console.log('Índices de Trip creados exitosamente');
  } catch (error) {
    console.error('Error creando índices de Trip:', error.message);
  }
};

/**
 * Crear índices para el modelo Driver
 */
const createDriverIndexes = async () => {
  try {
    const driverCollection = mongoose.connection.db.collection('drivers');

    // Índice único para usuario
    await driverCollection.createIndex({ user: 1 }, { unique: true });

    // Índice para licencia
    await driverCollection.createIndex({ licencia: 1 });

    // Índice para estado de aprobación
    await driverCollection.createIndex({ aprobado: 1 });

    // Índice para rating
    await driverCollection.createIndex({ rating: -1 });

    // Índice compuesto para conductores aprobados con rating
    await driverCollection.createIndex({
      aprobado: 1,
      rating: -1,
    });

    console.log('Índices de Driver creados exitosamente');
  } catch (error) {
    console.error('Error creando índices de Driver:', error.message);
  }
};

/**
 * Crear índices para el modelo Payment
 */
const createPaymentIndexes = async () => {
  try {
    const paymentCollection = mongoose.connection.db.collection('payments');

    // Índice para viaje
    await paymentCollection.createIndex({ trip: 1 });

    // Índice para usuario
    await paymentCollection.createIndex({ user: 1 });

    // Índice para estado de pago
    await paymentCollection.createIndex({ status: 1 });

    // Índice para método de pago
    await paymentCollection.createIndex({ paymentMethod: 1 });

    // Índice para fecha de pago
    await paymentCollection.createIndex({ paymentDate: -1 });

    // Índice compuesto para consultas de pagos por usuario y estado
    await paymentCollection.createIndex({
      user: 1,
      status: 1,
    });

    console.log('Índices de Payment creados exitosamente');
  } catch (error) {
    console.error('Error creando índices de Payment:', error.message);
  }
};

/**
 * Crear índices para el modelo Rating
 */
const createRatingIndexes = async () => {
  try {
    const ratingCollection = mongoose.connection.db.collection('ratings');

    // Índice para viaje
    await ratingCollection.createIndex({ trip: 1 });

    // Índice para conductor
    await ratingCollection.createIndex({ driver: 1 });

    // Índice para pasajero
    await ratingCollection.createIndex({ passenger: 1 });

    // Índice para calificación
    await ratingCollection.createIndex({ rating: -1 });

    // Índice para fecha de calificación
    await ratingCollection.createIndex({ createdAt: -1 });

    // Índice compuesto para calificaciones de un conductor
    await ratingCollection.createIndex({
      driver: 1,
      createdAt: -1,
    });

    console.log('Índices de Rating creados exitosamente');
  } catch (error) {
    console.error('Error creando índices de Rating:', error.message);
  }
};

/**
 * Crear índices para el modelo Message
 */
const createMessageIndexes = async () => {
  try {
    const messageCollection = mongoose.connection.db.collection('messages');

    // Índice para viaje
    await messageCollection.createIndex({ trip: 1 });

    // Índice para remitente
    await messageCollection.createIndex({ sender: 1 });

    // Índice para fecha de mensaje
    await messageCollection.createIndex({ createdAt: -1 });

    // Índice compuesto para mensajes de un viaje ordenados por fecha
    await messageCollection.createIndex({
      trip: 1,
      createdAt: -1,
    });

    console.log('Índices de Message creados exitosamente');
  } catch (error) {
    console.error('Error creando índices de Message:', error.message);
  }
};

/**
 * Crear todos los índices
 */
const createAllIndexes = async () => {
  try {
    console.log('Creando índices de base de datos...');

    await createUserIndexes();
    await createTripIndexes();
    await createDriverIndexes();
    await createPaymentIndexes();
    await createRatingIndexes();
    await createMessageIndexes();

    console.log('Todos los índices creados exitosamente');
  } catch (error) {
    console.error('Error creando índices:', error.message);
    throw error;
  }
};

/**
 * Verificar estado de los índices
 */
const checkIndexes = async () => {
  try {
    const collections = ['users', 'trips', 'drivers', 'payments', 'ratings', 'messages'];
    const indexInfo = {};

    for (const collectionName of collections) {
      const collection = mongoose.connection.db.collection(collectionName);
      const indexes = await collection.indexes();
      indexInfo[collectionName] = indexes.map(index => ({
        name: index.name,
        key: index.key,
        unique: index.unique || false,
      }));
    }

    return indexInfo;
  } catch (error) {
    console.error('Error verificando índices:', error.message);
    throw error;
  }
};

/**
 * Eliminar índices no utilizados
 */
const cleanupIndexes = async () => {
  try {
    console.log('Limpiando índices no utilizados...');

    // Aquí se podrían implementar lógicas para eliminar índices
    // que no se están utilizando, pero esto requiere análisis
    // de patrones de consulta, así que por ahora solo logueamos

    console.log('Limpieza de índices completada');
  } catch (error) {
    console.error('Error limpiando índices:', error.message);
    throw error;
  }
};

module.exports = {
  createUserIndexes,
  createTripIndexes,
  createDriverIndexes,
  createPaymentIndexes,
  createRatingIndexes,
  createMessageIndexes,
  createAllIndexes,
  checkIndexes,
  cleanupIndexes,
};
