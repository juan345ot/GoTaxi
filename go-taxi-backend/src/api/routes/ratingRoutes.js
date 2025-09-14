const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { verifyToken, permitRoles } = require('../../middlewares/auth');
const ROLES = require('../../config/roles');

/**
 * @route   POST /api/ratings/
 * @desc    Calificar viaje/conductor (pasajero o conductor)
 */
router.post('/', verifyToken, permitRoles(ROLES.PASAJERO, ROLES.CONDUCTOR), ratingController.createRating);

/**
 * @route   GET /api/ratings/trip/:tripId
 * @desc    Ver ratings de un viaje (pasajero, conductor o admin)
 */
router.get(
  '/trip/:tripId',
  verifyToken,
  permitRoles(ROLES.PASAJERO, ROLES.CONDUCTOR, ROLES.ADMIN),
  ratingController.getTripRatings,
);

module.exports = router;
