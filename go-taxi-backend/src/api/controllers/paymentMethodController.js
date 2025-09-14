const PaymentMethod = require('../../models/PaymentMethod');
const { logToFile } = require('../../utils/logger');

exports.addPaymentMethod = async (req, res, next) => {
  try {
    const { tipo, datos } = req.body;
    // Validar campos obligatorios
    if (!tipo || !datos) {
      const errObj = new Error('Faltan datos');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      errObj.details = { tipo, datos };
      return next(errObj);
    }

    const pm = new PaymentMethod({
      user: req.user.id,
      tipo,
      datos,
    });
    await pm.save();
    logToFile(`Método de pago agregado por ${req.user.email} (${tipo})`);
    return res.status(201).json(pm);
  } catch (err) {
    logToFile(`Error addPaymentMethod: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'PAYMENT_METHOD_CREATION_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.getPaymentMethods = async (req, res, next) => {
  try {
    const pms = await PaymentMethod.find({ user: req.user.id, activo: true });
    return res.json(pms);
  } catch (err) {
    logToFile(`Error getPaymentMethods: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'PAYMENT_METHODS_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};
