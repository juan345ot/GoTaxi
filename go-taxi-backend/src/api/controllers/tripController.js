const Trip = require('../../models/Trip');
const { validateCreateTrip } = require('../dtos/tripDTO');
const { logToFile } = require('../../utils/logger');

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
    });
    await trip.save();
    logToFile(`Viaje creado por pasajero ${req.user.email}`);
    return res.status(201).json(trip);
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
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { conductor: driverId, estado: 'asignado' },
      { new: true },
    );
    if (!trip) {
      const errObj = new Error('Viaje no encontrado');
      errObj.status = 404;
      errObj.code = 'TRIP_NOT_FOUND';
      return next(errObj);
    }
    logToFile(`Viaje ${trip._id} asignado a conductor ${driverId}`);
    return res.json(trip);
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
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true },
    );
    if (!trip) {
      const errObj = new Error('Viaje no encontrado');
      errObj.status = 404;
      errObj.code = 'TRIP_NOT_FOUND';
      return next(errObj);
    }
    logToFile(`Estado de viaje ${trip._id} cambiado a ${estado}`);
    return res.json(trip);
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
    const trip = await Trip.findById(req.params.id)
      .populate('pasajero', '-password')
      .populate('conductor');
    if (!trip) {
      const errObj = new Error('Viaje no encontrado');
      errObj.status = 404;
      errObj.code = 'TRIP_NOT_FOUND';
      return next(errObj);
    }
    return res.json(trip);
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
    const trips = await Trip.find({ pasajero: req.user.id });
    return res.json(trips);
  } catch (err) {
    logToFile(`Error getTripsByUser: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'USER_TRIPS_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};
