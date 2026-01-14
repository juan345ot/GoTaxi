const express = require('express');
// eslint-disable-next-line new-cap
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
router.put(
  '/:id/status',
  verifyToken,
  permitRoles(ROLES.CONDUCTOR, ROLES.ADMIN),
  tripController.updateStatus,
);

/**
 * @route   GET /api/trips/active
 * @desc    Obtener viajes activos (solo admin)
 */
router.get('/active', verifyToken, permitRoles(ROLES.ADMIN), tripController.getActiveTrips);

/**
 * @route   GET /api/trips/stats
 * @desc    Obtener estadísticas de viajes
 */
router.get('/stats', verifyToken, tripController.getTripStats);

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

/**
 * @route   POST /api/trips/:id/cancel
 * @desc    Cancelar viaje (pasajero)
 */
router.post('/:id/cancel', verifyToken, permitRoles(ROLES.PASAJERO), tripController.cancelTrip);

/**
 * @route   POST /api/trips/:id/pay
 * @desc    Confirmar pago del viaje (pasajero)
 */
router.post('/:id/pay', verifyToken, permitRoles(ROLES.PASAJERO), tripController.payTrip);

/**
 * @route   POST /api/trips/:id/rate
 * @desc    Calificar viaje (pasajero)
 */
router.post('/:id/rate', verifyToken, permitRoles(ROLES.PASAJERO), tripController.rateTrip);

module.exports = router;
