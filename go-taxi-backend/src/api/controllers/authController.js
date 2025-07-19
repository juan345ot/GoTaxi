const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const ROLES = require('../../config/roles');

// Helper para generar token
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
    const { nombre, apellido, email, password, role, telefono, licencia, auto } = req.body;
    if (!nombre || !apellido || !email || !password)
      return res.status(400).json({ message: 'Campos obligatorios faltantes' });

    // No se permite registro de admin por usuarios normales
    if (role === ROLES.ADMIN)
      return res.status(403).json({ message: 'No puedes crear admins desde este endpoint' });

    let exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'El email ya está registrado' });

    const hash = await bcrypt.hash(password, 10);

    const nuevo = new User({
      nombre,
      apellido,
      email,
      password: hash,
      role: role || ROLES.PASAJERO,
      telefono,
      licencia: role === ROLES.CONDUCTOR ? licencia : undefined,
      auto: role === ROLES.CONDUCTOR ? auto : undefined
    });
    await nuevo.save();

    const token = generateToken(nuevo);
    res.status(201).json({
      user: {
        id: nuevo._id,
        nombre: nuevo.nombre,
        apellido: nuevo.apellido,
        email: nuevo.email,
        role: nuevo.role
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar usuario', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Email o contraseña incorrectos' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Email o contraseña incorrectos' });

    const token = generateToken(user);
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
    res.status(500).json({ message: 'Error al iniciar sesión', error: err.message });
  }
};

// Crear admin solo por seed o desde panel admin. (Ejemplo, opcional)
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

    res.status(201).json({ message: 'Admin creado', id: nuevoAdmin._id });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear admin', error: err.message });
  }
};
