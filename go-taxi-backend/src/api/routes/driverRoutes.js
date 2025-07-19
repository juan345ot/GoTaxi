const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { verifyToken, permitRoles } = require('../../middlewares/auth');
const ROLES = require('../../config/roles');

// Solo admin puede listar todos los conductores
router.get('/', verifyToken, permitRoles(ROLES.ADMIN), driverController.getAllDrivers);

// Ver info de un conductor
router.get('/:id', verifyToken, driverController.getDriverById);

// Aprobar conductor (admin)
router.put('/:id/approve', verifyToken, permitRoles(ROLES.ADMIN), driverController.approveDriver);

module.exports = router;
