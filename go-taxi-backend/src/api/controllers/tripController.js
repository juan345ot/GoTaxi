const Trip = require('../../models/Trip');
const { validateCreateTrip } = require('../dtos/tripDTO');
const { logToFile } = require('../../utils/logger');

exports.createTrip = async (req, res) => {
  try {
    const { error } = validateCreateTrip(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const trip = new Trip({
      pasajero: req.user.id,
      origen: req.body.origen,
      destino: req.body.destino,
      tarifa: req.body.tarifa,
      distancia_km: req.body.distancia_km,
      duracion_min: req.body.duracion_min
    });
    await trip.save();
    logToFile(`Viaje creado por pasajero ${req.user.email}`);
    res.status(201).json(trip);
  } catch (err) {
    logToFile(`Error createTrip: ${err.message}`);
    res.status(500).json({ message: 'Error creando viaje', error: err.message });
  }
};

exports.assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { conductor: driverId, estado: 'asignado' },
      { new: true }
    );
    logToFile(`Viaje ${trip._id} asignado a conductor ${driverId}`);
    res.json(trip);
  } catch (err) {
    logToFile(`Error assignDriver: ${err.message}`);
    res.status(500).json({ message: 'Error asignando conductor', error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { estado } = req.body;
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );
    logToFile(`Estado de viaje ${trip._id} cambiado a ${estado}`);
    res.json(trip);
  } catch (err) {
    logToFile(`Error updateStatus: ${err.message}`);
    res.status(500).json({ message: 'Error actualizando estado', error: err.message });
  }
};

exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('pasajero', '-password')
      .populate('conductor');
    if (!trip) return res.status(404).json({ message: 'Viaje no encontrado' });
    res.json(trip);
  } catch (err) {
    logToFile(`Error getTripById: ${err.message}`);
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

exports.getTripsByUser = async (req, res) => {
  try {
    const trips = await Trip.find({ pasajero: req.user.id });
    res.json(trips);
  } catch (err) {
    logToFile(`Error getTripsByUser: ${err.message}`);
    res.status(500).json({ message: 'Error', error: err.message });
  }
};
