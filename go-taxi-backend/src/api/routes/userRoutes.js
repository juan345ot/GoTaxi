const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, permitRoles } = require('../../middlewares/auth');
const upload = require('../../middlewares/upload');
const ROLES = require('../../config/roles');

router.get('/', verifyToken, permitRoles(ROLES.ADMIN), userController.getAllUsers);
router.get('/:id', verifyToken, userController.getUserById);
router.put('/:id', verifyToken, upload.single('foto'), userController.updateUser);
router.delete('/:id', verifyToken, permitRoles(ROLES.ADMIN), userController.deleteUser);

module.exports = router;
