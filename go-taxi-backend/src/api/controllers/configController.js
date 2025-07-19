const Config = require('../../models/Config');

exports.getConfigs = async (req, res) => {
  try {
    const configs = await Config.find({ activo: true });
    res.json(configs);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo configs', error: err.message });
  }
};

exports.setConfig = async (req, res) => {
  try {
    const { tipo, valor, descripcion } = req.body;
    const config = new Config({ tipo, valor, descripcion });
    await config.save();
    res.status(201).json(config);
  } catch (err) {
    res.status(500).json({ message: 'Error guardando config', error: err.message });
  }
};
