const Trip = require('../../models/Trip');
const { validateCreateTrip } = require('../dtos/tripDTO');
const { logToFile } = require('../../utils/logger');
const { createSuccessResponse, createNotFoundResponse } = require('../../utils/responseHelpers');
const mongoose = require('mongoose');

exports.createTrip = async (req, res, next) => {
  try {
    const { error } = validateCreateTrip(req.body);
    if (error) {
      const errObj = new Error(error.details[0].message);
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      errObj.details = error.details;
      return next(errObj);
    }

    // Convertir valores numéricos para evitar strings en BD
    const tarifa = req.body.tarifa != null ? Number(req.body.tarifa) : undefined;
    const distancia = req.body.distancia_km != null ? Number(req.body.distancia_km) : undefined;
    const duracion = req.body.duracion_min != null ? Number(req.body.duracion_min) : undefined;

    const trip = new Trip({
      pasajero: req.user.id,
      origen: req.body.origen,
      destino: req.body.destino,
      tarifa,
      distancia_km: distancia,
      duracion_min: duracion,
      metodoPago: req.body.metodoPago,
    });
    await trip.save();
    logToFile(`Viaje creado por pasajero ${req.user.email}`);
    const tripObj = trip.toObject();
    return createSuccessResponse(
      res,
      {
        ...tripObj,
        id: trip._id,
        passengerId: tripObj.pasajero,
        status: tripObj.estado || 'pendiente',
      },
      'Viaje creado exitosamente',
      201,
    );
  } catch (err) {
    logToFile(`Error createTrip: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'TRIP_CREATION_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.assignDriver = async (req, res, next) => {
  try {
    const { driverId } = req.body;
    // Validar driverId
    if (!driverId) {
      const errObj = new Error('Falta driverId');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      errObj.details = { driverId };
      return next(errObj);
    }

    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return createNotFoundResponse(res, 'Viaje', req.params.id);
    }

    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { conductor: driverId, estado: 'asignado' },
      { new: true },
    );
    if (!trip) {
      return createNotFoundResponse(res, 'Viaje', req.params.id);
    }
    logToFile(`Viaje ${trip._id} asignado a conductor ${driverId}`);
    const tripObj = trip.toObject();
    return createSuccessResponse(
      res,
      {
        ...tripObj,
        id: trip._id,
        driverId: tripObj.conductor,
        status: tripObj.estado === 'asignado' ? 'accepted' : tripObj.estado,
      },
      'Conductor asignado exitosamente',
    );
  } catch (err) {
    logToFile(`Error assignDriver: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'DRIVER_ASSIGN_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { estado } = req.body;
    // Validar estado
    if (!estado) {
      const errObj = new Error('Estado requerido');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      errObj.details = { estado };
      return next(errObj);
    }
    const trip = await Trip.findByIdAndUpdate(req.params.id, { estado }, { new: true });
    if (!trip) {
      const errObj = new Error('Viaje no encontrado');
      errObj.status = 404;
      errObj.code = 'TRIP_NOT_FOUND';
      return next(errObj);
    }
    logToFile(`Estado de viaje ${trip._id} cambiado a ${estado}`);
    return createSuccessResponse(
      res,
      { ...trip.toObject(), id: trip._id },
      'Estado actualizado exitosamente',
    );
  } catch (err) {
    logToFile(`Error updateStatus: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'TRIP_STATUS_UPDATE_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.getTripById = async (req, res, next) => {
  try {
    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return createNotFoundResponse(res, 'Viaje', req.params.id);
    }

    const trip = await Trip.findById(req.params.id)
      .populate('pasajero', '-password')
      .populate('conductor');
    if (!trip) {
      return createNotFoundResponse(res, 'Viaje', req.params.id);
    }
    const tripObj = trip.toObject();
    return createSuccessResponse(
      res,
      {
        ...tripObj,
        id: trip._id,
        passengerId: tripObj.pasajero,
        driverId: tripObj.conductor,
        status: tripObj.estado,
      },
      'Viaje obtenido exitosamente',
    );
  } catch (err) {
    logToFile(`Error getTripById: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'TRIP_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.getTripsByUser = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const query = { pasajero: req.user.id };
    if (status) {
      // Mapear 'requested' a 'pendiente' para compatibilidad con tests
      query.estado = status === 'requested' ? 'pendiente' : status;
    }

    const trips = await Trip.find(query).skip(skip).limit(limit);
    const total = await Trip.countDocuments(query);

    const tripsWithId = trips.map(trip => {
      const tripObj = trip.toObject();
      return {
        ...tripObj,
        id: trip._id,
        passengerId: tripObj.pasajero,
        status: tripObj.estado,
      };
    });

    // Si hay paginación, devolver con formato especial
    if (req.query.page || req.query.limit) {
      return res.status(200).json({
        success: true,
        data: tripsWithId,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    return createSuccessResponse(res, tripsWithId, 'Viajes obtenidos exitosamente');
  } catch (err) {
    logToFile(`Error getTripsByUser: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'USER_TRIPS_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.cancelTrip = async (req, res, next) => {
  try {
    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return createNotFoundResponse(res, 'Viaje', req.params.id);
    }

    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { estado: 'cancelado' },
      { new: true },
    );

    if (!trip) {
      return createNotFoundResponse(res, 'Viaje', req.params.id);
    }

    logToFile(`Viaje ${trip._id} cancelado por pasajero ${req.user.email}`);
    const tripObj = trip.toObject();
    return createSuccessResponse(
      res,
      {
        ...tripObj,
        id: trip._id,
        status: tripObj.estado === 'cancelado' ? 'cancelled' : tripObj.estado,
      },
      'Viaje cancelado exitosamente',
    );
  } catch (err) {
    logToFile(`Error cancelTrip: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'TRIP_CANCEL_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.payTrip = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;

    if (!paymentMethod) {
      const errObj = new Error('Método de pago requerido');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      return next(errObj);
    }

    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      {
        estado: 'completado',
        metodoPago: paymentMethod,
        fechaPago: new Date(),
      },
      { new: true },
    );

    if (!trip) {
      const errObj = new Error('Viaje no encontrado');
      errObj.status = 404;
      errObj.code = 'TRIP_NOT_FOUND';
      return next(errObj);
    }

    logToFile(
      `Viaje ${trip._id} pagado por pasajero ${req.user.email} con método ${paymentMethod}`,
    );
    return createSuccessResponse(
      res,
      { ...trip.toObject(), id: trip._id },
      'Pago confirmado exitosamente',
    );
  } catch (err) {
    logToFile(`Error payTrip: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'TRIP_PAYMENT_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.rateTrip = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      const errObj = new Error('Calificación debe ser entre 1 y 5');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      return next(errObj);
    }

    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      {
        calificacion_pasajero: rating,
        comentario: comment || '',
      },
      { new: true },
    );

    if (!trip) {
      const errObj = new Error('Viaje no encontrado');
      errObj.status = 404;
      errObj.code = 'TRIP_NOT_FOUND';
      return next(errObj);
    }

    logToFile(
      `Viaje ${trip._id} calificado con ${rating} estrellas por pasajero ${req.user.email}`,
    );
    return createSuccessResponse(
      res,
      { ...trip.toObject(), id: trip._id },
      'Viaje calificado exitosamente',
    );
  } catch (err) {
    logToFile(`Error rateTrip: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'TRIP_RATING_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.getActiveTrips = async (req, res, next) => {
  try {
    const activeTrips = await Trip.find({
      estado: { $in: ['pendiente', 'asignado', 'en_camino', 'en_origen'] },
    })
      .populate('pasajero', '-password')
      .populate('conductor');

    const { createSuccessResponse } = require('../../utils/responseHelpers');
    return createSuccessResponse(res, activeTrips, 'Viajes activos obtenidos exitosamente');
  } catch (err) {
    logToFile(`Error getActiveTrips: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'ACTIVE_TRIPS_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.getTripStats = async (req, res, next) => {
  try {
    const total = await Trip.countDocuments();
    const completed = await Trip.countDocuments({ estado: 'completado' });
    const cancelled = await Trip.countDocuments({ estado: 'cancelado' });
    const active = await Trip.countDocuments({
      estado: { $in: ['pendiente', 'asignado', 'en_camino', 'en_origen'] },
    });

    const totalRevenue = await Trip.aggregate([
      { $match: { estado: 'completado' } },
      { $group: { _id: null, total: { $sum: '$tarifa' } } },
    ]);

    const avgFare = await Trip.aggregate([
      { $match: { estado: 'completado', tarifa: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$tarifa' } } },
    ]);

    const stats = {
      total,
      completed,
      cancelled,
      active,
      totalFare: totalRevenue[0]?.total || 0,
      averageFare: avgFare[0]?.avg || 0,
    };

    const { createSuccessResponse } = require('../../utils/responseHelpers');
    return createSuccessResponse(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (err) {
    logToFile(`Error getTripStats: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'TRIP_STATS_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};
// Funciones de selección y confirmación de conductor
exports.selectDriver = async (req, res, next) => {
  try {
    const { driverId } = req.body;

    if (!driverId) {
      const errObj = new Error('driverId es requerido');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      return next(errObj);
    }

    // Validar que el ID del viaje sea válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return createNotFoundResponse(res, 'Viaje', req.params.id);
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return createNotFoundResponse(res, 'Viaje', req.params.id);
    }

    // Verificar que el viaje esté en estado pendiente
    if (trip.estado !== 'pendiente') {
      const errObj = new Error('Solo se pueden asignar conductores a viajes pendientes');
      errObj.status = 400;
      errObj.code = 'INVALID_TRIP_STATE';
      return next(errObj);
    }

    // Verificar que el pasajero sea el dueño del viaje
    if (trip.pasajero.toString() !== req.user.id) {
      const errObj = new Error('No autorizado para modificar este viaje');
      errObj.status = 403;
      errObj.code = 'UNAUTHORIZED';
      return next(errObj);
    }

    // Actualizar viaje con conductor seleccionado
    trip.conductor = driverId;
    trip.estado = 'esperando_confirmacion';
    await trip.save();

    // Emitir notificación WebSocket al conductor
    const helpers = require('../../sockets/socketHelpers');
    helpers.emitToUser(driverId, {
      type: 'trip_request',
      tripId: trip._id,
      pasajero: req.user.id,
      origen: trip.origen,
      destino: trip.destino,
      tarifa: trip.tarifa,
    });

    logToFile(`Pasajero ${req.user.email} seleccionó conductor ${driverId} para viaje ${trip._id}`);

    const tripObj = trip.toObject();
    return createSuccessResponse(
      res,
      {
        ...tripObj,
        id: trip._id,
        status: 'waiting_confirmation',
      },
      'Conductor seleccionado, esperando confirmación',
    );
  } catch (err) {
    logToFile(`Error selectDriver: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'SELECT_DRIVER_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.confirmTrip = async (req, res, next) => {
  try {
    // Validar que el ID del viaje sea válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return createNotFoundResponse(res, 'Viaje', req.params.id);
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return createNotFoundResponse(res, 'Viaje', req.params.id);
    }

    // Verificar que el viaje esté esperando confirmación
    if (trip.estado !== 'esperando_confirmacion') {
      const errObj = new Error('Solo se pueden confirmar viajes en espera de confirmación');
      errObj.status = 400;
      errObj.code = 'INVALID_TRIP_STATE';
      return next(errObj);
    }

    // Verificar que el conductor sea el asignado
    if (trip.conductor.toString() !== req.user.id) {
      const errObj = new Error('No estás asignado a este viaje');
      errObj.status = 403;
      errObj.code = 'UNAUTHORIZED';
      return next(errObj);
    }

    // Confirmar viaje
    trip.estado = 'asignado';
    await trip.save();

    // Emitir notificación WebSocket al pasajero
    const helpers = require('../../sockets/socketHelpers');
    helpers.emitToUser(trip.pasajero.toString(), {
      type: 'trip_confirmed',
      tripId: trip._id,
      conductor: req.user.id,
    });

    logToFile(`Conductor ${req.user.email} confirmó viaje ${trip._id}`);

    const tripObj = trip.toObject();
    return createSuccessResponse(
      res,
      {
        ...tripObj,
        id: trip._id,
        status: 'accepted',
      },
      'Viaje confirmado exitosamente',
    );
  } catch (err) {
    logToFile(`Error confirmTrip: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'CONFIRM_TRIP_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.rejectTripAsDriver = async (req, res, next) => {
  try {
    // Validar que el ID del viaje sea válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return createNotFoundResponse(res, 'Viaje', req.params.id);
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return createNotFoundResponse(res, 'Viaje', req.params.id);
    }

    // Verificar que el viaje esté esperando confirmación
    if (trip.estado !== 'esperando_confirmacion') {
      const errObj = new Error('Solo se pueden rechazar viajes en espera de confirmación');
      errObj.status = 400;
      errObj.code = 'INVALID_TRIP_STATE';
      return next(errObj);
    }

    // Verificar que el conductor sea el asignado
    if (trip.conductor.toString() !== req.user.id) {
      const errObj = new Error('No estás asignado a este viaje');
      errObj.status = 403;
      errObj.code = 'UNAUTHORIZED';
      return next(errObj);
    }

    // Rechazar viaje - volver a estado pendiente
    trip.conductor = null;
    trip.estado = 'pendiente';
    await trip.save();

    // Emitir notificación WebSocket al pasajero
    const helpers = require('../../sockets/socketHelpers');
    helpers.emitToUser(trip.pasajero.toString(), {
      type: 'trip_rejected',
      tripId: trip._id,
    });

    logToFile(`Conductor ${req.user.email} rechazó viaje ${trip._id}`);

    const tripObj = trip.toObject();
    return createSuccessResponse(
      res,
      {
        ...tripObj,
        id: trip._id,
        status: 'pending',
      },
      'Viaje rechazado, liberado para otros conductores',
    );
  } catch (err) {
    logToFile(`Error rejectTripAsDriver: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'REJECT_TRIP_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

module.exports = {
  selectDriver: exports.selectDriver,
  confirmTrip: exports.confirmTrip,
  rejectTripAsDriver: exports.rejectTripAsDriver,
};
