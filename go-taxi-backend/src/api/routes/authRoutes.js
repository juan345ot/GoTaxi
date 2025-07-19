const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, permitRoles } = require('../../middlewares/auth');
const ROLES = require('../../config/roles');

router.post('/register', authController.register);
router.post('/login', authController.login);
// Crear admin (solo admin autenticado)
router.post('/admin', verifyToken, permitRoles(ROLES.ADMIN), authController.createAdmin);

module.exports = router;
