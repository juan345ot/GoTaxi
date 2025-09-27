const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, permitRoles } = require('../../middlewares/auth');
const upload = require('../../middlewares/upload');
const ROLES = require('../../config/roles');

/**
 * @route   GET /api/users/
 * @desc    Listar todos los usuarios (solo admin)
 */
router.get('/', verifyToken, permitRoles(ROLES.ADMIN), userController.getAllUsers);

/**
 * @route   GET /api/users/me
 * @desc    Ver perfil del usuario actual
 */
router.get('/me', verifyToken, userController.getCurrentUser);

/**
 * @route   GET /api/users/:id
 * @desc    Ver perfil usuario
 */
router.get('/:id', verifyToken, userController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Editar datos/foto usuario (solo dueño o admin)
 */
router.put('/:id', verifyToken, upload.single('foto'), userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Borrar usuario (solo admin)
 */
router.delete('/:id', verifyToken, permitRoles(ROLES.ADMIN), userController.deleteUser);

module.exports = router;
