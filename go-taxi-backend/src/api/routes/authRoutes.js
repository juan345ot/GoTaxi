const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, permitRoles } = require('../../middlewares/auth');
const ROLES = require('../../config/roles');

// Registro para pasajeros y conductores
router.post('/register', authController.register);

// Login general
router.post('/login', authController.login);

// Crear admin (solo admins autenticados pueden crear nuevos admins)
router.post('/admin', verifyToken, permitRoles(ROLES.ADMIN), authController.createAdmin);

module.exports = router;
