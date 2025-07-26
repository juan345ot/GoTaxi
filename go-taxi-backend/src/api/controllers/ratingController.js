const Rating = require('../../models/Rating');
const { logToFile } = require('../../utils/logger');

exports.createRating = async (req, res) => {
  try {
    const { trip, puntuacion, comentario, autor, conductor, pasajero } = req.body;
    if (!trip || !puntuacion || !autor) return res.status(400).json({ message: 'Faltan datos obligatorios' });

    const rating = new Rating({
      trip,
      puntuacion,
      comentario,
      autor,
      conductor,
      pasajero
    });
    await rating.save();
    logToFile(`Rating creado por ${autor} - trip ${trip}`);
    res.status(201).json(rating);
  } catch (err) {
    logToFile(`Error createRating: ${err.message}`);
    res.status(500).json({ message: 'Error al crear rating', error: err.message });
  }
};

exports.getTripRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ trip: req.params.tripId });
    res.json(ratings);
  } catch (err) {
    logToFile(`Error getTripRatings: ${err.message}`);
    res.status(500).json({ message: 'Error al obtener ratings', error: err.message });
  }
};
