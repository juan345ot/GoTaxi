const Driver = require('../../models/Driver');
const User = require('../../models/User');

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate('user', '-password');
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener conductores', error: err.message });
  }
};

exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('user', '-password');
    if (!driver) return res.status(404).json({ message: 'Conductor no encontrado' });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

exports.approveDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, { aprobado: true }, { new: true }).populate('user', '-password');
    if (!driver) return res.status(404).json({ message: 'Conductor no encontrado' });
    res.json({ message: 'Conductor aprobado', driver });
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};
