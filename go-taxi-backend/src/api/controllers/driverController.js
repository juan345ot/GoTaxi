const Driver = require('../../models/Driver');
// const User = require('../../models/User'); // No usado
const { logToFile } = require('../../utils/logger');
const { createNotFoundResponse } = require('../../utils/responseHelpers');
const mongoose = require('mongoose');

exports.getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find().populate('user', '-password');
    return res.json(drivers);
  } catch (err) {
    logToFile(`Error getAllDrivers: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'DRIVERS_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.getDriverById = async (req, res, next) => {
  try {
    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return createNotFoundResponse(res, 'Conductor', req.params.id);
    }

    const driver = await Driver.findById(req.params.id).populate('user', '-password');
    if (!driver) {
      return createNotFoundResponse(res, 'Conductor', req.params.id);
    }
    return res.json(driver);
  } catch (err) {
    logToFile(`Error getDriverById: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'DRIVER_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.approveDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { aprobado: true },
      { new: true },
    ).populate('user', '-password');
    if (!driver) {
      const errObj = new Error('Conductor no encontrado');
      errObj.status = 404;
      errObj.code = 'DRIVER_NOT_FOUND';
      return next(errObj);
    }

    logToFile(`Conductor aprobado: ${driver.user.email}`);
    return res.json({ message: 'Conductor aprobado', driver });
  } catch (err) {
    logToFile(`Error approveDriver: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'DRIVER_APPROVAL_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.getAvailableDrivers = async (req, res, next) => {
  try {
    // Obtener conductores disponibles y aprobados
    const drivers = await Driver.find({
      aprobado: true,
      disponible: true,
    }).populate('user', '-password');

    // Formatear respuesta con datos completos
    const driversData = drivers.map(driver => {
      const driverObj = driver.toObject();
      return {
        id: driver._id,
        user: driverObj.user,
        vehiculo: driverObj.vehiculo,
        calificacion: driverObj.calificacion || 5.0,
        ubicacion: driverObj.ubicacion,
        licencia: driverObj.licencia,
      };
    });

    return res.json({
      success: true,
      data: driversData,
      message: 'Conductores disponibles obtenidos exitosamente',
    });
  } catch (err) {
    logToFile(`Error getAvailableDrivers: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'AVAILABLE_DRIVERS_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};
