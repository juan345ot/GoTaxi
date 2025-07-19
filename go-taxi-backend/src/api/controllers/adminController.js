const User = require('../../models/User');
const Admin = require('../../models/Admin');
const ROLES = require('../../config/roles');

// Solo ejemplo: obtener todos los admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().populate('user', '-password');
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener admins', error: err.message });
  }
};
