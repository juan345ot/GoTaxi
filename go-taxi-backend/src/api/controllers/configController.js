const Config = require('../../models/Config');
const { logToFile } = require('../../utils/logger');

exports.getConfigs = async (req, res) => {
  try {
    const configs = await Config.find({ activo: true });
    res.json(configs);
  } catch (err) {
    logToFile(`Error getConfigs: ${err.message}`);
    res.status(500).json({ message: 'Error obteniendo configs', error: err.message });
  }
};

exports.setConfig = async (req, res) => {
  try {
    const { tipo, valor, descripcion } = req.body;
    if (!tipo || !valor) return res.status(400).json({ message: 'Faltan datos' });

    const config = new Config({ tipo, valor, descripcion });
    await config.save();
    logToFile(`Config creada: ${tipo} - ${valor}`);
    res.status(201).json(config);
  } catch (err) {
    logToFile(`Error setConfig: ${err.message}`);
    res.status(500).json({ message: 'Error guardando config', error: err.message });
  }
};
