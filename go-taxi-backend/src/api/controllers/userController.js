const User = require('../../models/User');
const ROLES = require('../../config/roles');
const bcrypt = require('bcryptjs');
const { validateUpdateUser } = require('../dtos/userDTO');
const { logToFile } = require('../../utils/logger');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    logToFile(`Error getAllUsers: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener usuarios', error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    logToFile(`Error getUserById: ${err.message}`);
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    // Permitir sólo dueño o admin
    if (req.user.id !== req.params.id && req.user.role !== ROLES.ADMIN)
      return res.status(403).json({ message: 'No autorizado' });

    const { error } = validateUpdateUser(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const updateData = { ...req.body };

    if (req.file) updateData.foto = `/uploads/${req.file.filename}`;
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    logToFile(`Usuario actualizado: ${user.email} (${user.role})`);
    res.json(user);
  } catch (err) {
    logToFile(`Error updateUser: ${err.message}`);
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== ROLES.ADMIN)
      return res.status(403).json({ message: 'Sólo un admin puede borrar usuarios.' });

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    logToFile(`Usuario eliminado: ${user.email}`);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    logToFile(`Error deleteUser: ${err.message}`);
    res.status(500).json({ message: 'Error', error: err.message });
  }
};
