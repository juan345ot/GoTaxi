const PaymentMethod = require('../../models/PaymentMethod');

exports.addPaymentMethod = async (req, res) => {
  try {
    const { tipo, datos } = req.body;
    const pm = new PaymentMethod({
      user: req.user.id,
      tipo,
      datos
    });
    await pm.save();
    res.status(201).json(pm);
  } catch (err) {
    res.status(500).json({ message: 'Error creando método de pago', error: err.message });
  }
};

exports.getPaymentMethods = async (req, res) => {
  try {
    const pms = await PaymentMethod.find({ user: req.user.id, activo: true });
    res.json(pms);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};
