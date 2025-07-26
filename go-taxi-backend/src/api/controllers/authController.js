const User = require('../../models/User');
const Driver = require('../../models/Driver');
const Admin = require('../../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ROLES = require('../../config/roles');
const { validateRegister, validateLogin } = require('../dtos/authDTO');
const { logToFile } = require('../../utils/logger');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      nombre: user.nombre,
      apellido: user.apellido
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

exports.register = async (req, res) => {
  try {
    const { error } = validateRegister(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { nombre, apellido, email, password, role, telefono, licencia, vehiculo } = req.body;

    if (role === ROLES.ADMIN)
      return res.status(403).json({ message: 'No puedes crear admins desde este endpoint' });

    let exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'El email ya está registrado' });

    const hash = await bcrypt.hash(password, 10);

    const nuevoUsuario = new User({
      nombre,
      apellido,
      email,
      password: hash,
      role: role || ROLES.PASAJERO,
      telefono,
    });
    await nuevoUsuario.save();

    if (role === ROLES.CONDUCTOR) {
      const newDriver = new Driver({
        user: nuevoUsuario._id,
        licencia,
        vehiculo
      });
      await newDriver.save();
    }

    const token = generateToken(nuevoUsuario);
    logToFile(`Nuevo registro: ${email} (${role || 'pasajero'})`);
    res.status(201).json({
      user: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        email: nuevoUsuario.email,
        role: nuevoUsuario.role
      },
      token
    });
  } catch (err) {
    logToFile(`Error al registrar usuario: ${err.message}`);
    res.status(500).json({ message: 'Error al registrar usuario', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Email o contraseña incorrectos' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Email o contraseña incorrectos' });

    const token = generateToken(user);
    logToFile(`Login: ${email} (${user.role})`);
    res.json({
      user: {
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    logToFile(`Error login: ${err.message}`);
    res.status(500).json({ message: 'Error al iniciar sesión', error: err.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { nombre, apellido, email, password } = req.body;
    if (!nombre || !apellido || !email || !password)
      return res.status(400).json({ message: 'Faltan campos' });

    let exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'El email ya existe' });

    const hash = await bcrypt.hash(password, 10);

    const nuevoAdmin = new User({
      nombre,
      apellido,
      email,
      password: hash,
      role: ROLES.ADMIN,
      activo: true
    });
    await nuevoAdmin.save();

    const adminRef = new Admin({ user: nuevoAdmin._id });
    await adminRef.save();

    logToFile(`Admin creado: ${email}`);
    res.status(201).json({ message: 'Admin creado', id: nuevoAdmin._id });
  } catch (err) {
    logToFile(`Error al crear admin: ${err.message}`);
    res.status(500).json({ message: 'Error al crear admin', error: err.message });
  }
};
