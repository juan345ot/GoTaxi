const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');
const { verifyToken, permitRoles } = require('../../middlewares/auth');
const ROLES = require('../../config/roles');

/**
 * @route   POST /api/payment-methods/
 * @desc    Agregar método de pago (solo pasajeros)
 */
router.post('/', verifyToken, permitRoles(ROLES.PASAJERO), paymentMethodController.addPaymentMethod);

/**
 * @route   GET /api/payment-methods/
 * @desc    Listar métodos de pago (solo pasajeros)
 */
router.get('/', verifyToken, permitRoles(ROLES.PASAJERO), paymentMethodController.getPaymentMethods);

module.exports = router;
