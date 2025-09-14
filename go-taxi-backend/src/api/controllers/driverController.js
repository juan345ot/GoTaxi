const Driver = require('../../models/Driver');
const User = require('../../models/User');
const { logToFile } = require('../../utils/logger');

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
    const driver = await Driver.findById(req.params.id).populate('user', '-password');
    if (!driver) {
      const errObj = new Error('Conductor no encontrado');
      errObj.status = 404;
      errObj.code = 'DRIVER_NOT_FOUND';
      return next(errObj);
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
