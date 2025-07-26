const PaymentMethod = require('../../models/PaymentMethod');
const { logToFile } = require('../../utils/logger');

exports.addPaymentMethod = async (req, res) => {
  try {
    const { tipo, datos } = req.body;
    if (!tipo || !datos) return res.status(400).json({ message: 'Faltan datos' });

    const pm = new PaymentMethod({
      user: req.user.id,
      tipo,
      datos
    });
    await pm.save();
    logToFile(`Método de pago agregado por ${req.user.email} (${tipo})`);
    res.status(201).json(pm);
  } catch (err) {
    logToFile(`Error addPaymentMethod: ${err.message}`);
    res.status(500).json({ message: 'Error creando método de pago', error: err.message });
  }
};

exports.getPaymentMethods = async (req, res) => {
  try {
    const pms = await PaymentMethod.find({ user: req.user.id, activo: true });
    res.json(pms);
  } catch (err) {
    logToFile(`Error getPaymentMethods: ${err.message}`);
    res.status(500).json({ message: 'Error', error: err.message });
  }
};
