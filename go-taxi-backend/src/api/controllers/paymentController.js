const Payment = require('../../models/Payment');
const mercadoPagoService = require('../../services/mercadoPagoService');
const { logToFile } = require('../../utils/logger');

exports.paySimulado = async (req, res) => {
  try {
    const { tripId, monto, metodo } = req.body;
    if (!tripId || !monto || !metodo) return res.status(400).json({ message: 'Faltan datos' });

    const payment = new Payment({
      trip: tripId,
      user: req.user.id,
      monto,
      metodo,
      status: metodo === 'efectivo' ? 'pagado' : 'pendiente'
    });
    await payment.save();
    logToFile(`Pago simulado: ${req.user.email} - $${monto} (${metodo})`);
    res.status(201).json(payment);
  } catch (err) {
    logToFile(`Error paySimulado: ${err.message}`);
    res.status(500).json({ message: 'Error en pago simulado', error: err.message });
  }
};

exports.payMercadoPago = async (req, res) => {
  try {
    const { tripId, monto } = req.body;
    const userEmail = req.user.email;
    if (!tripId || !monto) return res.status(400).json({ message: 'Faltan datos' });

    const result = await mercadoPagoService.createPayment({
      monto,
      description: `Viaje GoTaxi #${tripId}`,
      payer_email: userEmail
    });
    const payment = new Payment({
      trip: tripId,
      user: req.user.id,
      monto,
      metodo: 'mercadopago',
      status: 'pendiente',
      mp_preference_id: result.body.id
    });
    await payment.save();
    logToFile(`Pago Mercado Pago iniciado: ${userEmail} - $${monto}`);
    res.status(201).json({
      payment,
      mercadoPago: result.body
    });
  } catch (err) {
    logToFile(`Error payMercadoPago: ${err.message}`);
    res.status(500).json({ message: 'Error en pago Mercado Pago', error: err.message });
  }
};
