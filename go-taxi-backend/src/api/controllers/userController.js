const User = require('../../models/User');
const ROLES = require('../../config/roles');
const bcrypt = require('bcryptjs');
const { validateUpdateUser } = require('../dtos/userDTO');
const { logToFile } = require('../../utils/logger');
const { createSuccessResponse, createNotFoundResponse } = require('../../utils/responseHelpers');
const mongoose = require('mongoose');

exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;
    const skip = (page - 1) * limit;

    const query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('-password').skip(skip).limit(limit);
    const total = await User.countDocuments(query);

    return createSuccessResponse(
      res,
      { users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
      'Usuarios obtenidos exitosamente',
    );
  } catch (err) {
    logToFile(`Error getAllUsers: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'USERS_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    logToFile(`getCurrentUser called with user: ${JSON.stringify(req.user)}`);
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return createNotFoundResponse(res, 'Usuario');
    }
    logToFile(`getCurrentUser found user: ${user.email}`);
    return createSuccessResponse(res, user, 'Perfil obtenido exitosamente');
  } catch (err) {
    logToFile(`Error getCurrentUser: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'USER_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

// Alias para compatibilidad con tests que usan /api/users/profile
exports.getProfile = exports.getCurrentUser;

exports.getUserById = async (req, res, next) => {
  try {
    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return createNotFoundResponse(res, 'Usuario', req.params.id);
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return createNotFoundResponse(res, 'Usuario', req.params.id);
    }
    const userObj = user.toObject();
    return createSuccessResponse(
      res,
      { ...userObj, id: user._id },
      'Usuario obtenido exitosamente',
    );
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
    // Solo admin puede actualizar otros usuarios (la ruta ya verifica esto, pero por seguridad)
    if (req.user.role !== ROLES.ADMIN) {
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
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select(
      '-password',
    );
    if (!user) {
      const errObj = new Error('Usuario no encontrado');
      errObj.status = 404;
      errObj.code = 'USER_NOT_FOUND';
      return next(errObj);
    }

    logToFile(`Usuario actualizado: ${user.email} (${user.role})`);
    return createSuccessResponse(res, user, 'Usuario actualizado exitosamente');
  } catch (err) {
    logToFile(`Error updateUser: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'USER_UPDATE_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { error } = validateUpdateUser(req.body);
    if (error) {
      const errObj = new Error(error.details[0].message);
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      errObj.details = error.details;
      return next(errObj);
    }

    const updateData = { ...req.body };
    delete updateData.password; // No permitir cambiar contraseña desde aquí

    if (req.file) updateData.foto = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select(
      '-password',
    );
    if (!user) {
      return createNotFoundResponse(res, 'Usuario');
    }

    logToFile(`Perfil actualizado: ${user.email}`);
    return createSuccessResponse(res, user, 'Perfil actualizado exitosamente');
  } catch (err) {
    logToFile(`Error updateProfile: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'PROFILE_UPDATE_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      const errObj = new Error('Se requiere contraseña actual y nueva contraseña');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      return next(errObj);
    }

    // Permitir contraseñas de mínimo 6 caracteres (consistente con el frontend)
    if (newPassword.length < 6) {
      const errObj = new Error('La nueva contraseña debe tener al menos 6 caracteres');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      return next(errObj);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return createNotFoundResponse(res, 'Usuario');
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      const errObj = new Error('Contraseña actual incorrecta');
      errObj.status = 400;
      errObj.code = 'INVALID_PASSWORD';
      return next(errObj);
    }

    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();

    logToFile(`Contraseña actualizada: ${user.email}`);
    return createSuccessResponse(res, null, 'Contraseña actualizada exitosamente');
  } catch (err) {
    logToFile(`Error changePassword: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'PASSWORD_CHANGE_FAILED';
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
    return createSuccessResponse(res, null, 'Usuario eliminado exitosamente');
  } catch (err) {
    logToFile(`Error deleteUser: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'USER_DELETE_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};
