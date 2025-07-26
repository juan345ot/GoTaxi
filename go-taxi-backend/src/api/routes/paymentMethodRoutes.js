const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');
const { verifyToken } = require('../../middlewares/auth');

/**
 * @route   POST /api/payment-methods/
 * @desc    Agregar método de pago usuario
 */
router.post('/', verifyToken, paymentMethodController.addPaymentMethod);

/**
 * @route   GET /api/payment-methods/
 * @desc    Listar métodos de pago usuario
 */
router.get('/', verifyToken, paymentMethodController.getPaymentMethods);

module.exports = router;
