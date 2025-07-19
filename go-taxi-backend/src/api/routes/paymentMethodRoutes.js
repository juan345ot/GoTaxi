const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');
const { verifyToken } = require('../../middlewares/auth');

router.post('/', verifyToken, paymentMethodController.addPaymentMethod);
router.get('/', verifyToken, paymentMethodController.getPaymentMethods);

module.exports = router;
