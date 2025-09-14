const Payment = require('../../models/Payment');
const mercadoPagoService = require('../../services/mercadoPagoService');
const { logToFile } = require('../../utils/logger');

exports.paySimulado = async (req, res, next) => {
  try {
    const { tripId, monto, metodo } = req.body;
    // Validar campos obligatorios
    if (!tripId || !monto || !metodo) {
      const errObj = new Error('Faltan datos');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      errObj.details = { tripId, monto, metodo };
      return next(errObj);
    }
    // Validar monto positivo
    const amount = Number(monto);
    if (Number.isNaN(amount) || amount <= 0) {
      const errObj = new Error('Monto inválido');
      errObj.status = 400;
      errObj.code = 'INVALID_AMOUNT';
      errObj.details = { monto };
      return next(errObj);
    }

    const payment = new Payment({
      trip: tripId,
      user: req.user.id,
      monto: amount,
      metodo,
      status: metodo === 'efectivo' ? 'pagado' : 'pendiente',
    });
    await payment.save();
    logToFile(`Pago simulado: ${req.user.email} - $${amount} (${metodo})`);
    return res.status(201).json(payment);
  } catch (err) {
    logToFile(`Error paySimulado: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'SIMULATED_PAYMENT_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.payMercadoPago = async (req, res, next) => {
  try {
    const { tripId, monto } = req.body;
    const userEmail = req.user.email;
    // Validar campos obligatorios
    if (!tripId || !monto) {
      const errObj = new Error('Faltan datos');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      errObj.details = { tripId, monto };
      return next(errObj);
    }
    // Validar monto positivo
    const amount = Number(monto);
    if (Number.isNaN(amount) || amount <= 0) {
      const errObj = new Error('Monto inválido');
      errObj.status = 400;
      errObj.code = 'INVALID_AMOUNT';
      errObj.details = { monto };
      return next(errObj);
    }

    // Crear pago en Mercado Pago
    const result = await mercadoPagoService.createPayment({
      monto: amount,
      description: `Viaje GoTaxi #${tripId}`,
      payer_email: userEmail,
    });
    const payment = new Payment({
      trip: tripId,
      user: req.user.id,
      monto: amount,
      metodo: 'mercadopago',
      status: 'pendiente',
      mp_preference_id: result.body.id,
    });
    await payment.save();
    logToFile(`Pago Mercado Pago iniciado: ${userEmail} - $${amount}`);
    return res.status(201).json({
      payment,
      mercadoPago: result.body,
    });
  } catch (err) {
    logToFile(`Error payMercadoPago: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'MP_PAYMENT_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};
