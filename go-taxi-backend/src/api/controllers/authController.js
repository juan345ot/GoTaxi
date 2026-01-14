const User = require('../../models/User');
const Driver = require('../../models/Driver');
const Admin = require('../../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ROLES = require('../../config/roles');
const { validateRegister, validateLogin } = require('../dtos/authDTO');
const { logToFile } = require('../../utils/logger');
const { createSuccessResponse } = require('../../utils/responseHelpers');

const generateToken = user => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      nombre: user.nombre,
      apellido: user.apellido,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
  );
};

exports.register = async (req, res, next) => {
  try {
    // Validación de los datos de entrada
    const { error } = validateRegister(req.body);
    if (error) {
      const errObj = new Error(error.details[0].message);
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      errObj.details = error.details;
      return next(errObj);
    }

    const { nombre, apellido, email, password, role, telefono, licencia, vehiculo } = req.body;

    // No se permite crear administradores desde este endpoint
    if (role === ROLES.ADMIN) {
      const errObj = new Error('No puedes crear admins desde este endpoint');
      errObj.status = 403;
      errObj.code = 'FORBIDDEN_ROLE_CREATION';
      return next(errObj);
    }

    // Verificar si el email ya existe
    const exists = await User.findOne({ email });
    if (exists) {
      const errObj = new Error('El email ya está registrado');
      errObj.status = 409;
      errObj.code = 'EMAIL_ALREADY_REGISTERED';
      return next(errObj);
    }

    // Encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    // Crear y guardar el nuevo usuario
    const nuevoUsuario = new User({
      nombre,
      apellido,
      email,
      password: hash,
      role: role || ROLES.PASAJERO,
      telefono,
    });
    await nuevoUsuario.save();

    // Si el rol es conductor, crear registro de Driver asociado
    if (role === ROLES.CONDUCTOR) {
      const newDriver = new Driver({
        user: nuevoUsuario._id,
        licencia,
        vehiculo,
      });
      await newDriver.save();
    }

    // Generar token JWT para el nuevo usuario
    const token = generateToken(nuevoUsuario);
    logToFile(`Nuevo registro: ${email} (${role || 'pasajero'})`);
    return createSuccessResponse(
      res,
      {
        user: {
          id: nuevoUsuario._id,
          nombre: nuevoUsuario.nombre,
          apellido: nuevoUsuario.apellido,
          email: nuevoUsuario.email,
          role: nuevoUsuario.role,
        },
        accessToken: token,
      },
      'Usuario registrado exitosamente',
      201,
    );
  } catch (err) {
    // Loguear y propagar el error con contrato uniforme
    logToFile(`Error al registrar usuario: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'REGISTER_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    // Validación de credenciales
    const { error } = validateLogin(req.body);
    if (error) {
      const errObj = new Error(error.details[0].message);
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      errObj.details = error.details;
      return next(errObj);
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      const errObj = new Error('Email o contraseña incorrectos');
      errObj.status = 401;
      errObj.code = 'INVALID_CREDENTIALS';
      return next(errObj);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      const errObj = new Error('Email o contraseña incorrectos');
      errObj.status = 401;
      errObj.code = 'INVALID_CREDENTIALS';
      return next(errObj);
    }

    const token = generateToken(user);
    logToFile(`Login: ${email} (${user.role})`);
    return createSuccessResponse(
      res,
      {
        user: {
          id: user._id,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          role: user.role,
        },
        accessToken: token,
      },
      'Login exitoso',
      200,
    );
  } catch (err) {
    logToFile(`Error login: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'LOGIN_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.createAdmin = async (req, res, next) => {
  try {
    const { nombre, apellido, email, password } = req.body;
    // Validar campos obligatorios
    if (!nombre || !apellido || !email || !password) {
      const errObj = new Error('Faltan campos');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      errObj.details = { nombre, apellido, email, password };
      return next(errObj);
    }

    // Verificar si el email ya existe
    const exists = await User.findOne({ email });
    if (exists) {
      const errObj = new Error('El email ya existe');
      errObj.status = 409;
      errObj.code = 'EMAIL_ALREADY_EXISTS';
      return next(errObj);
    }

    // Encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    // Crear usuario con rol ADMIN y marcarlo como activo
    const nuevoAdmin = new User({
      nombre,
      apellido,
      email,
      password: hash,
      role: ROLES.ADMIN,
      activo: true,
    });
    await nuevoAdmin.save();

    // Crear referencia de Admin para modelo Admin
    const adminRef = new Admin({ user: nuevoAdmin._id });
    await adminRef.save();

    logToFile(`Admin creado: ${email}`);
    return createSuccessResponse(res, { id: nuevoAdmin._id }, 'Admin creado exitosamente', 201);
  } catch (err) {
    logToFile(`Error al crear admin: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'ADMIN_CREATION_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    // En una implementación completa, aquí se invalidaría el token
    // Por ahora, simplemente confirmamos el logout
    logToFile(`Logout: ${req.user?.email || 'unknown'}`);
    return createSuccessResponse(res, null, 'Logout exitoso');
  } catch (err) {
    logToFile(`Error logout: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'LOGOUT_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      const errObj = new Error('Refresh token requerido');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      return next(errObj);
    }

    // En una implementación completa, aquí se validaría el refresh token
    // Por ahora, devolvemos un error indicando que no está implementado
    const errObj = new Error('Refresh token no implementado');
    errObj.status = 501;
    errObj.code = 'NOT_IMPLEMENTED';
    return next(errObj);
  } catch (err) {
    logToFile(`Error refresh: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'REFRESH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

// Endpoint de test para crear admins sin autenticación (solo en modo test)
exports.createAdminTest = async (req, res, next) => {
  try {
    // Solo permitir en modo test
    if (process.env.NODE_ENV !== 'test') {
      const errObj = new Error('Este endpoint solo está disponible en modo test');
      errObj.status = 403;
      errObj.code = 'FORBIDDEN';
      return next(errObj);
    }

    const { nombre, apellido, email, password } = req.body;

    if (!nombre || !apellido || !email || !password) {
      const errObj = new Error('Faltan campos');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      return next(errObj);
    }

    // Verificar si el email ya existe
    const exists = await User.findOne({ email });
    if (exists) {
      const errObj = new Error('El email ya existe');
      errObj.status = 409;
      errObj.code = 'EMAIL_ALREADY_EXISTS';
      return next(errObj);
    }

    // Encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    // Crear usuario con rol ADMIN
    const nuevoAdmin = new User({
      nombre,
      apellido,
      email,
      password: hash,
      role: ROLES.ADMIN,
      activo: true,
    });
    await nuevoAdmin.save();

    // Crear referencia de Admin
    const adminRef = new Admin({ user: nuevoAdmin._id });
    await adminRef.save();

    // Generar token
    const token = generateToken(nuevoAdmin);

    logToFile(`Admin de test creado: ${email}`);
    return createSuccessResponse(
      res,
      {
        user: {
          id: nuevoAdmin._id,
          nombre: nuevoAdmin.nombre,
          apellido: nuevoAdmin.apellido,
          email: nuevoAdmin.email,
          role: nuevoAdmin.role,
        },
        accessToken: token,
      },
      'Admin de test creado exitosamente',
      201,
    );
  } catch (err) {
    logToFile(`Error al crear admin de test: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'ADMIN_TEST_CREATION_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};
