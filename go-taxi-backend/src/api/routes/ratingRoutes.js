const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { verifyToken } = require('../../middlewares/auth');

/**
 * @route   POST /api/ratings/
 * @desc    Calificar viaje/conductor
 */
router.post('/', verifyToken, ratingController.createRating);

/**
 * @route   GET /api/ratings/trip/:tripId
 * @desc    Ver ratings de un viaje
 */
router.get('/trip/:tripId', verifyToken, ratingController.getTripRatings);

module.exports = router;
