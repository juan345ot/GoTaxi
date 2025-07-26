const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { verifyToken, permitRoles } = require('../../middlewares/auth');
const ROLES = require('../../config/roles');

/**
 * @route   GET /api/configs/
 * @desc    Ver tarifas y comisiones (usuario)
 */
router.get('/', verifyToken, configController.getConfigs);

/**
 * @route   POST /api/configs/
 * @desc    Crear nueva config (solo admin)
 */
router.post('/', verifyToken, permitRoles(ROLES.ADMIN), configController.setConfig);

module.exports = router;
