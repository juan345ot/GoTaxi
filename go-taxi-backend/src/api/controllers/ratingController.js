const Rating = require('../../models/Rating');
const { logToFile } = require('../../utils/logger');

exports.createRating = async (req, res, next) => {
  try {
    const { trip, puntuacion, comentario, autor, conductor, pasajero } = req.body;
    // Validar campos obligatorios
    if (!trip || !puntuacion || !autor) {
      const errObj = new Error('Faltan datos obligatorios');
      errObj.status = 400;
      errObj.code = 'VALIDATION_ERROR';
      errObj.details = { trip, puntuacion, autor };
      return next(errObj);
    }
    // Validar puntuación en rango permitido
    const score = Number(puntuacion);
    if (Number.isNaN(score) || score < 1 || score > 5) {
      const errObj = new Error('Puntuación inválida');
      errObj.status = 400;
      errObj.code = 'INVALID_RATING_SCORE';
      errObj.details = { puntuacion };
      return next(errObj);
    }

    const rating = new Rating({
      trip,
      puntuacion: score,
      comentario,
      autor,
      conductor,
      pasajero,
    });
    await rating.save();
    logToFile(`Rating creado por ${autor} - trip ${trip}`);
    return res.status(201).json(rating);
  } catch (err) {
    logToFile(`Error createRating: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'RATING_CREATION_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};

exports.getTripRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find({ trip: req.params.tripId });
    return res.json(ratings);
  } catch (err) {
    logToFile(`Error getTripRatings: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'TRIP_RATINGS_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};
