const User = require('../../models/User');
const ROLES = require('../../config/roles');
const bcrypt = require('bcryptjs');
const { validateUpdateUser } = require('../dtos/userDTO');
const { logToFile } = require('../../utils/logger');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    return res.json(users);
  } catch (err) {
    logToFile(`Error getAllUsers: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'USERS_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      const errObj = new Error('Usuario no encontrado');
      errObj.status = 404;
      errObj.code = 'USER_NOT_FOUND';
      return next(errObj);
    }
    return res.json(user);
  } catch (err) {
    logToFile(`Error getUserById: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'USER_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    // Permitir sólo dueño o admin
    if (req.user.id !== req.params.id && req.user.role !== ROLES.ADMIN) {
      const errObj = new Error('No autorizado');
      errObj.status = 403;
      errObj.code = 'FORBIDDEN';
      return next(errObj);
    }

    const { error } = validateUpdateUser(req.body);
    if (error) {
      const errObj = new Error(error.details[0].message);
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      errObj.details = error.details;
      return next(errObj);
    }

    const updateData = { ...req.body };

    if (req.file) updateData.foto = `/uploads/${req.file.filename}`;
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) {
      const errObj = new Error('Usuario no encontrado');
      errObj.status = 404;
      errObj.code = 'USER_NOT_FOUND';
      return next(errObj);
    }

    logToFile(`Usuario actualizado: ${user.email} (${user.role})`);
    return res.json(user);
  } catch (err) {
    logToFile(`Error updateUser: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'USER_UPDATE_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.ADMIN) {
      const errObj = new Error('Sólo un admin puede borrar usuarios.');
      errObj.status = 403;
      errObj.code = 'FORBIDDEN';
      return next(errObj);
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      const errObj = new Error('Usuario no encontrado');
      errObj.status = 404;
      errObj.code = 'USER_NOT_FOUND';
      return next(errObj);
    }

    logToFile(`Usuario eliminado: ${user.email}`);
    return res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    logToFile(`Error deleteUser: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'USER_DELETE_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};
