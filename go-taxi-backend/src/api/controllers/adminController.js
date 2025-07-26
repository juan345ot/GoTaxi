const Admin = require('../../models/Admin');
const { logToFile } = require('../../utils/logger');

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().populate('user', '-password');
    res.json(admins);
  } catch (err) {
    logToFile(`Error getAllAdmins: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener admins', error: err.message });
  }
};
