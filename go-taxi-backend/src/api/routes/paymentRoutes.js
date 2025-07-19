const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../../middlewares/auth');

// Simulado: efectivo/tarjeta (no real)
router.post('/simulado', verifyToken, paymentController.paySimulado);

// Real: Mercado Pago
router.post('/mercadopago', verifyToken, paymentController.payMercadoPago);

module.exports = router;
