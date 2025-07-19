const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { verifyToken } = require('../../middlewares/auth');

router.post('/', verifyToken, ratingController.createRating);
router.get('/trip/:tripId', verifyToken, ratingController.getTripRatings);

module.exports = router;
