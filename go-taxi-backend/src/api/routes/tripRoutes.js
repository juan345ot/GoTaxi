const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { verifyToken, permitRoles } = require('../../middlewares/auth');
const ROLES = require('../../config/roles');

/**
 * @route   POST /api/trips/
 * @desc    Crear viaje (pasajero)
 */
router.post('/', verifyToken, permitRoles(ROLES.PASAJERO), tripController.createTrip);

/**
 * @route   PUT /api/trips/:id/assign
 * @desc    Asignar conductor (admin)
 */
router.put('/:id/assign', verifyToken, permitRoles(ROLES.ADMIN), tripController.assignDriver);

/**
 * @route   PUT /api/trips/:id/status
 * @desc    Cambiar estado de viaje (conductor/admin)
 */
router.put('/:id/status', verifyToken, permitRoles(ROLES.CONDUCTOR, ROLES.ADMIN), tripController.updateStatus);

/**
 * @route   GET /api/trips/:id
 * @desc    Obtener viaje por id (usuario/conductor/admin)
 */
router.get('/:id', verifyToken, tripController.getTripById);

/**
 * @route   GET /api/trips/
 * @desc    Listar viajes del usuario
 */
router.get('/', verifyToken, permitRoles(ROLES.PASAJERO), tripController.getTripsByUser);

module.exports = router;
