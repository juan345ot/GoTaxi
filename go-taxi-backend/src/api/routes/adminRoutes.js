const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, permitRoles } = require('../../middlewares/auth');
const ROLES = require('../../config/roles');

/**
 * @route   GET /api/admins/
 * @desc    Listar todos los admins (solo admin)
 */
router.get('/', verifyToken, permitRoles(ROLES.ADMIN), adminController.getAllAdmins);

module.exports = router;
