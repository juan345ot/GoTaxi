const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, permitRoles } = require('../../middlewares/auth');
const ROLES = require('../../config/roles');

/**
 * @route   POST /api/payments/simulado
 * @desc    Pago simulado (efectivo/tarjeta) – solo para pasajeros
 */
router.post('/simulado', verifyToken, permitRoles(ROLES.PASAJERO), paymentController.paySimulado);

/**
 * @route   POST /api/payments/mercadopago
 * @desc    Pago real Mercado Pago – solo para pasajeros
 */
router.post('/mercadopago', verifyToken, permitRoles(ROLES.PASAJERO), paymentController.payMercadoPago);

module.exports = router;
