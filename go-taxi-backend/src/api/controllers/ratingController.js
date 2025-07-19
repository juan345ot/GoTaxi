const Rating = require('../../models/Rating');

exports.createRating = async (req, res) => {
  try {
    const { trip, puntuacion, comentario, autor, conductor, pasajero } = req.body;
    const rating = new Rating({
      trip,
      puntuacion,
      comentario,
      autor,
      conductor,
      pasajero
    });
    await rating.save();
    res.status(201).json(rating);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear rating', error: err.message });
  }
};

exports.getTripRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ trip: req.params.tripId });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener ratings', error: err.message });
  }
};
