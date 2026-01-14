const Admin = require('../../models/Admin');
const { logToFile } = require('../../utils/logger');

/**
 * GET /api/admins
 * Soporta:
 *  - page (default 1)
 *  - limit (default 20, máx 100)
 *  - sort (default -createdAt)  ej: "createdAt" o "-createdAt"
 *  - search (por nombre/email del usuario asociado al admin)
 *
 * Respuesta:
 *  { data: [...], meta: { page, limit, total, totalPages, sort, search } }
 */
exports.getAllAdmins = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const sortQuery = (req.query.sort || '-createdAt').trim();
    const search = (req.query.search || '').trim();

    // Armamos sort dinámico para aggregate
    const sort = sortQuery.startsWith('-') ? { [sortQuery.slice(1)]: -1 } : { [sortQuery]: 1 };

    // Como el filtro es por campos del usuario (poblado), usamos aggregate + $lookup
    const matchStage = {};
    if (search) {
      matchStage.$or = [
        { 'userDoc.name': { $regex: search, $options: 'i' } },
        { 'userDoc.email': { $regex: search, $options: 'i' } },
      ];
    }

    // Total de documentos (con el match aplicado)
    const totalAgg = await Admin.aggregate([
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userDoc' } },
      { $unwind: { path: '$userDoc', preserveNullAndEmptyArrays: true } },
      Object.keys(matchStage).length ? { $match: matchStage } : { $match: {} },
      { $count: 'count' },
    ]);

    const total = totalAgg[0]?.count || 0;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const skip = (page - 1) * limit;

    // Página de resultados
    const admins = await Admin.aggregate([
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userDoc' } },
      { $unwind: { path: '$userDoc', preserveNullAndEmptyArrays: true } },
      Object.keys(matchStage).length ? { $match: matchStage } : { $match: {} },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          __v: 0,
          'userDoc.password': 0,
          'userDoc.__v': 0,
        },
      },
    ]);

    return res.status(200).json({
      data: admins,
      meta: { page, limit, total, totalPages, sort: sortQuery, search },
    });
  } catch (err) {
    // Log + contrato de error unificado (el errorHandler será el responsable de formatear)
    logToFile(`Error getAllAdmins: ${err.message}`);
    err.status = err.status || 500;
    err.code = err.code || 'ADMINS_FETCH_FAILED';
    err.details = err.details || null;
    return next(err);
  }
};
