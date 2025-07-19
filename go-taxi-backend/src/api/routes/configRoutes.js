const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { verifyToken, permitRoles } = require('../../middlewares/auth');
const ROLES = require('../../config/roles');

router.get('/', verifyToken, configController.getConfigs);
router.post('/', verifyToken, permitRoles(ROLES.ADMIN), configController.setConfig);

module.exports = router;
