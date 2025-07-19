const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { verifyToken, permitRoles } = require('../../middlewares/auth');
const ROLES = require('../../config/roles');

// Crear viaje (pasajero)
router.post('/', verifyToken, permitRoles(ROLES.PASAJERO), tripController.createTrip);
// Asignar conductor (admin o sistema)
router.put('/:id/assign', verifyToken, permitRoles(ROLES.ADMIN), tripController.assignDriver);
// Actualizar estado de viaje (conductor/admin)
router.put('/:id/status', verifyToken, permitRoles(ROLES.CONDUCTOR, ROLES.ADMIN), tripController.updateStatus);
// Obtener viaje por id
router.get('/:id', verifyToken, tripController.getTripById);
// Listar viajes de usuario
router.get('/', verifyToken, permitRoles(ROLES.PASAJERO), tripController.getTripsByUser);

module.exports = router;
