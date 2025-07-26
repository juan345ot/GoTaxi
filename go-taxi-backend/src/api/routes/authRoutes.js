const express = require('express');
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

module.exports = router;
