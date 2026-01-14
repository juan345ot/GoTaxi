const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, permitRoles } = require('../../middlewares/auth');
const ROLES = require('../../config/roles');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar usuario o conductor
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login general
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/admin
 * @desc    Crear admin (solo admins autenticados)
 */
router.post('/admin', verifyToken, permitRoles(ROLES.ADMIN), authController.createAdmin);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión
 */
router.post('/logout', verifyToken, authController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refrescar token de acceso
 */
router.post('/refresh', authController.refresh);

/**
 * @route   POST /api/auth/admin/test
 * @desc    Crear admin para tests (solo en modo test)
 */
router.post('/admin/test', authController.createAdminTest);

module.exports = router;
