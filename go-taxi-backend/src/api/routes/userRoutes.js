const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const userController = require('../controllers/userController');
const addressController = require('../controllers/addressController');
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
 * @route   GET /api/users/profile
 * @desc    Ver perfil del usuario actual (alias de /me)
 */
router.get('/profile', verifyToken, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Actualizar perfil del usuario actual
 */
router.put('/profile', verifyToken, upload.single('foto'), userController.updateProfile);

/**
 * @route   PUT /api/users/me/password
 * @desc    Cambiar contraseña del usuario actual
 */
router.put('/me/password', verifyToken, userController.changePassword);

/**
 * @route   PUT /api/users/password (alias para compatibilidad)
 * @desc    Cambiar contraseña del usuario actual
 */
router.put('/password', verifyToken, userController.changePassword);

/**
 * IMPORTANTE: Las rutas de direcciones deben ir ANTES de /:id para evitar conflictos
 */

/**
 * @route   GET /api/users/me/addresses
 * @desc    Obtener todas las direcciones del usuario actual
 */
router.get('/me/addresses', verifyToken, addressController.getUserAddresses);

/**
 * @route   POST /api/users/me/addresses
 * @desc    Crear una nueva dirección para el usuario actual
 */
router.post('/me/addresses', verifyToken, addressController.createAddress);

/**
 * @route   GET /api/users/me/addresses/:id
 * @desc    Obtener una dirección específica por ID
 */
router.get('/me/addresses/:id', verifyToken, addressController.getAddressById);

/**
 * @route   PUT /api/users/me/addresses/:id
 * @desc    Actualizar una dirección existente
 */
router.put('/me/addresses/:id', verifyToken, addressController.updateAddress);

/**
 * @route   DELETE /api/users/me/addresses/:id
 * @desc    Eliminar una dirección
 */
router.delete('/me/addresses/:id', verifyToken, addressController.deleteAddress);

/**
 * @route   GET /api/users/:id
 * @desc    Ver perfil usuario (solo admin)
 * IMPORTANTE: Esta ruta debe ir al final para no interceptar rutas más específicas
 */
router.get('/:id', verifyToken, permitRoles(ROLES.ADMIN), userController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Editar datos/foto usuario (solo admin)
 */
router.put(
  '/:id',
  verifyToken,
  permitRoles(ROLES.ADMIN),
  upload.single('foto'),
  userController.updateUser,
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Borrar usuario (solo admin)
 */
router.delete('/:id', verifyToken, permitRoles(ROLES.ADMIN), userController.deleteUser);

module.exports = router;
