const Payment = require('../../models/Payment');
const mercadoPagoService = require('../../services/mercadoPagoService');

exports.paySimulado = async (req, res) => {
  try {
    const { tripId, monto, metodo } = req.body;
    const payment = new Payment({
      trip: tripId,
      user: req.user.id,
      monto,
      metodo,
      status: metodo === 'efectivo' ? 'pagado' : 'pendiente'
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Error en pago simulado', error: err.message });
  }
};

exports.payMercadoPago = async (req, res) => {
  try {
    const { tripId, monto } = req.body;
    const userEmail = req.user.email;
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
    res.status(201).json({
      payment,
      mercadoPago: result.body
    });
  } catch (err) {
    res.status(500).json({ message: 'Error en pago Mercado Pago', error: err.message });
  }
};
