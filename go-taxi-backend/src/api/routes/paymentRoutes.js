const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../../middlewares/auth');

/**
 * @route   POST /api/payments/simulado
 * @desc    Pago simulado (efectivo/tarjeta)
 */
router.post('/simulado', verifyToken, paymentController.paySimulado);

/**
 * @route   POST /api/payments/mercadopago
 * @desc    Pago real Mercado Pago
 */
router.post('/mercadopago', verifyToken, paymentController.payMercadoPago);

module.exports = router;
