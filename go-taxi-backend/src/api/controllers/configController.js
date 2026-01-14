const Config = require('../../models/Config');
const { logToFile } = require('../../utils/logger');
/* eslint-disable max-len, operator-linebreak, indent */

exports.getConfigs = async (req, res, next) => {
  try {
    // Recuperar configuraciones activas
    const configs = await Config.find({ activo: true });
    return res.json(configs);
  } catch (err) {
    // Loguear el error y propagar al manejador global
    logToFile(`Error getConfigs: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'CONFIGS_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.setConfig = async (req, res, next) => {
  try {
    const { tipo, valor, descripcion } = req.body;
    // Validar campos obligatorios
    if (!tipo || !valor) {
      const errObj = new Error('Faltan datos');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      errObj.details = { tipo, valor };
      return next(errObj);
    }

    // Crear y guardar la nueva configuración
    const config = new Config({
      tipo,
      valor,
      descripcion,
    });
    await config.save();
    logToFile(`Config creada: ${tipo} - ${valor}`);
    return res.status(201).json(config);
  } catch (err) {
    logToFile(`Error setConfig: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'CONFIG_CREATION_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};
