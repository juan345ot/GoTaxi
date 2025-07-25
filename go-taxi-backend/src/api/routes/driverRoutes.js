const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { verifyToken, permitRoles } = require('../../middlewares/auth');
const ROLES = require('../../config/roles');

/**
 * @route   GET /api/drivers/
 * @desc    Listar todos los conductores (admin)
 */
router.get('/', verifyToken, permitRoles(ROLES.ADMIN), driverController.getAllDrivers);

/**
 * @route   GET /api/drivers/:id
 * @desc    Ver info de un conductor (usuario/conductor/admin)
 */
router.get('/:id', verifyToken, driverController.getDriverById);

/**
 * @route   PUT /api/drivers/:id/approve
 * @desc    Aprobar conductor (admin)
 */
router.put('/:id/approve', verifyToken, permitRoles(ROLES.ADMIN), driverController.approveDriver);

module.exports = router;
