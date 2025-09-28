const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../../middlewares/auth');

/**
 * @route   GET /api/trips/:id/messages
 * @desc    Obtener mensajes de un viaje
 */
router.get('/:id/messages', verifyToken, chatController.getMessages);

/**
 * @route   POST /api/trips/:id/messages
 * @desc    Enviar mensaje en un viaje
 */
router.post('/:id/messages', verifyToken, chatController.sendMessage);

module.exports = router;
