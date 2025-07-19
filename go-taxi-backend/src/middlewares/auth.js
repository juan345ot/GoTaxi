const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ROLES = require('../config/roles');

const auth = {};

auth.verifyToken = (req, res, next) => {
  let token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Token requerido' });

  if (token.startsWith('Bearer ')) token = token.slice(7, token.length);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token inválido' });
    req.user = decoded;
    next();
  });
};

auth.permitRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'No tienes permisos para esta acción' });
  next();
};

module.exports = auth;
