const Trip = require('../models/Trip');
const TripEntity = require('../domain/entities/Trip');

/**
 * Repository para operaciones de Trip
 * Abstrae el acceso a la base de datos
 */
class TripRepository {
  /**
   * Crear un nuevo viaje
   */
  async create(tripData) {
    try {
      // Mapear de entidad a modelo de Mongoose
      const mongooseData = this.fromEntity(tripData);
      const trip = new Trip(mongooseData);
      const savedTrip = await trip.save();
      return this.toEntity(savedTrip);
    } catch (error) {
      throw new Error(`Error al crear viaje: ${error.message}`);
    }
  }

  /**
   * Buscar viaje por ID
   */
  async findById(id) {
    try {
      const trip = await Trip.findById(id)
        .populate('pasajero', 'name lastname email phone')
        .populate({
          path: 'conductor',
          select: 'name lastname email phone rating',
          model: 'Driver',
          populate: {
            path: 'user',
            select: '_id',
          },
        });

      return trip ? this.toEntity(trip) : null;
    } catch (error) {
      throw new Error(`Error al buscar viaje: ${error.message}`);
    }
  }

  /**
   * Buscar viajes por pasajero
   */
  async findByPassengerId(passengerId, options = {}) {
    try {
      const { page = 1, limit = 10, status } = options;
      const query = { pasajero: passengerId };

      if (status) {
        // Mapear estado de inglés a español
        const statusMap = {
          requested: 'pendiente',
          accepted: 'asignado',
          driver_arrived: 'en_curso',
          in_progress: 'en_curso',
          completed: 'completado',
          cancelled: 'cancelado',
        };
        query.estado = statusMap[status] || status;
      }

      const trips = await Trip.find(query)
        .populate({
          path: 'conductor',
          select: 'name lastname email phone rating',
          model: 'Driver',
          populate: {
            path: 'user',
            select: '_id',
          },
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Trip.countDocuments(query);

      return {
        trips: trips.map(trip => this.toEntity(trip)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error al buscar viajes del pasajero: ${error.message}`);
    }
  }

  /**
   * Buscar viajes por conductor
   */
  async findByDriverId(driverId, options = {}) {
    try {
      const { page = 1, limit = 10, status } = options;
      const query = { conductor: driverId };

      if (status) {
        // Mapear estado de inglés a español
        const statusMap = {
          requested: 'pendiente',
          accepted: 'asignado',
          driver_arrived: 'en_curso',
          in_progress: 'en_curso',
          completed: 'completado',
          cancelled: 'cancelado',
        };
        query.estado = statusMap[status] || status;
      }

      const trips = await Trip.find(query)
        .populate('pasajero', 'name lastname email phone')
        .populate({
          path: 'conductor',
          select: 'name lastname email phone rating',
          model: 'Driver',
          populate: {
            path: 'user',
            select: '_id',
          },
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Trip.countDocuments(query);

      return {
        trips: trips.map(trip => this.toEntity(trip)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error al buscar viajes del conductor: ${error.message}`);
    }
  }

  /**
   * Buscar viajes por estado
   */
  async findByStatus(status, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;

      // Mapear estado de inglés a español
      const statusMap = {
        requested: 'pendiente',
        accepted: 'asignado',
        driver_arrived: 'en_curso',
        in_progress: 'en_curso',
        completed: 'completado',
        cancelled: 'cancelado',
      };
      const estado = statusMap[status] || status;

      const trips = await Trip.find({ estado })
        .populate('pasajero', 'name lastname email phone')
        .populate({
          path: 'conductor',
          select: 'name lastname email phone rating',
          model: 'Driver',
          populate: {
            path: 'user',
            select: '_id',
          },
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Trip.countDocuments({ estado });

      return {
        trips: trips.map(trip => this.toEntity(trip)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error al buscar viajes por estado: ${error.message}`);
    }
  }

  /**
   * Actualizar viaje
   */
  async update(id, updateData) {
    try {
      // Mapear status de inglés a español si existe
      const mongooseData = { ...updateData };
      if (mongooseData.status) {
        const statusMap = {
          requested: 'pendiente',
          accepted: 'asignado',
          driver_arrived: 'en_curso',
          in_progress: 'en_curso',
          completed: 'completado',
          cancelled: 'cancelado',
        };
        mongooseData.estado = statusMap[mongooseData.status] || mongooseData.status;
        delete mongooseData.status;
      }

      // Mapear driverId a conductor si existe
      if (mongooseData.driverId) {
        mongooseData.conductor = mongooseData.driverId;
        delete mongooseData.driverId;
      }

      const trip = await Trip.findByIdAndUpdate(
        id,
        { ...mongooseData, updatedAt: new Date() },
        { new: true, runValidators: true },
      )
        .populate('pasajero', 'name lastname email phone')
        .populate({
          path: 'conductor',
          select: 'name lastname email phone rating',
          model: 'Driver',
          populate: {
            path: 'user',
            select: '_id',
          },
        });

      return trip ? this.toEntity(trip) : null;
    } catch (error) {
      throw new Error(`Error al actualizar viaje: ${error.message}`);
    }
  }

  /**
   * Eliminar viaje
   */
  async delete(id) {
    try {
      const trip = await Trip.findByIdAndDelete(id);
      return trip ? this.toEntity(trip) : null;
    } catch (error) {
      throw new Error(`Error al eliminar viaje: ${error.message}`);
    }
  }

  /**
   * Buscar viajes activos(no completados ni cancelados)
   */
  async findActiveTrips() {
    try {
      // Mapear estados de inglés a español
      const estadoMap = {
        requested: 'pendiente',
        accepted: 'asignado',
        driver_arrived: 'en_curso',
        in_progress: 'en_curso',
      };
      const estados = ['requested', 'accepted', 'driver_arrived', 'in_progress'].map(
        s => estadoMap[s] || s,
      );

      const trips = await Trip.find({
        estado: { $in: estados },
      })
        .populate('pasajero', 'name lastname email phone')
        .populate({
          path: 'conductor',
          select: 'name lastname email phone rating',
          model: 'Driver',
          populate: {
            path: 'user',
            select: '_id',
          },
        });

      return trips.map(trip => this.toEntity(trip));
    } catch (error) {
      throw new Error(`Error al buscar viajes activos: ${error.message}`);
    }
  }

  /**
   * Buscar viajes por rango de fechas con optimizaciones
   * @param {Date} startDate - Fecha de inicio
   * @param {Date} endDate - Fecha de fin
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Object>} Resultado con viajes y paginación
   */
  async findByDateRange(startDate, endDate, options = {}) {
    try {
      const { page = 1, limit = 10, status } = options;
      const query = {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      if (status) {
        // Mapear estado de inglés a español
        const statusMap = {
          requested: 'pendiente',
          accepted: 'asignado',
          driver_arrived: 'en_curso',
          in_progress: 'en_curso',
          completed: 'completado',
          cancelled: 'cancelado',
        };
        query.estado = statusMap[status] || status;
      }

      const trips = await Trip.find(query)
        .populate('pasajero', 'name lastname email phone')
        .populate({
          path: 'conductor',
          select: 'name lastname email phone rating',
          model: 'Driver',
          populate: {
            path: 'user',
            select: '_id',
          },
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Trip.countDocuments(query);

      return {
        trips: trips.map(trip => this.toEntity(trip)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error al buscar viajes por rango de fechas: ${error.message}`);
    }
  }

  /**
   * Buscar viajes por múltiples estados de manera eficiente
   * @param {Array<string>} statuses - Array de estados
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array<TripEntity>>} Array de entidades de viaje
   */
  async findByStatuses(statuses, options = {}) {
    try {
      const { limit = 50, sortBy = 'createdAt', sortOrder = -1 } = options;

      // Mapear estados de inglés a español
      const estadoMap = {
        requested: 'pendiente',
        accepted: 'asignado',
        driver_arrived: 'en_curso',
        in_progress: 'en_curso',
        completed: 'completado',
        cancelled: 'cancelado',
      };
      const estadosEsp = statuses.map(s => estadoMap[s] || s);

      const trips = await Trip.find({ estado: { $in: estadosEsp } })
        .populate('pasajero', 'name lastname email phone')
        .populate({
          path: 'conductor',
          select: 'name lastname email phone rating',
          model: 'Driver',
          populate: {
            path: 'user',
            select: '_id',
          },
        })
        .sort({ [sortBy]: sortOrder })
        .limit(limit)
        .lean(); // Usar lean() para mejor rendimiento

      return trips.map(trip => this.toEntity(trip));
    } catch (error) {
      throw new Error(`Error al buscar viajes por estados: ${error.message}`);
    }
  }

  /**
   * Buscar viajes cercanos a una ubicación
   * @param {Object} location - Ubicación con latitud y longitud
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array<TripEntity>>} Array de viajes cercanos
   */
  async findNearbyTrips(location, options = {}) {
    try {
      const { maxDistance = 10000, limit = 20, status } = options; // 10km por defecto

      const query = {
        'origin.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude],
            },
            $maxDistance: maxDistance,
          },
        },
      };

      if (status) {
        query.status = status;
      }

      const trips = await Trip.find(query)
        .populate('pasajero', 'name lastname email phone')
        .populate({
          path: 'conductor',
          select: 'name lastname email phone rating',
          model: 'Driver',
          populate: {
            path: 'user',
            select: '_id',
          },
        })
        .limit(limit)
        .lean();

      return trips.map(trip => this.toEntity(trip));
    } catch (error) {
      throw new Error(`Error al buscar viajes cercanos: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de viajes con agregaciones optimizadas
   * @param {Object} filters - Filtros para las estadísticas
   * @returns {Promise<Object>} Estadísticas de viajes
   */
  async getTripStats(filters = {}) {
    try {
      const matchStage = {};

      if (filters.status) {
        matchStage.status = filters.status;
      }

      if (filters.passengerId) {
        matchStage.passengerId = filters.passengerId;
      }

      if (filters.driverId) {
        matchStage.driverId = filters.driverId;
      }

      if (filters.dateFrom || filters.dateTo) {
        matchStage.createdAt = {};
        if (filters.dateFrom) {
          matchStage.createdAt.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          matchStage.createdAt.$lte = new Date(filters.dateTo);
        }
      }

      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
            active: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['requested', 'accepted', 'driver_arrived', 'in_progress']] },
                  1,
                  0,
                ],
              },
            },
            totalFare: { $sum: { $ifNull: ['$tarifa', 0] } },
            averageFare: { $avg: { $ifNull: ['$tarifa', 0] } },
            totalDistance: { $sum: { $ifNull: ['$distancia_km', 0] } },
            averageDistance: { $avg: { $ifNull: ['$distancia_km', 0] } },
          },
        },
      ];

      const result = await Trip.aggregate(pipeline);
      return (
        result[0] || {
          total: 0,
          completed: 0,
          cancelled: 0,
          active: 0,
          totalFare: 0,
          averageFare: 0,
          totalDistance: 0,
          averageDistance: 0,
        }
      );
    } catch (error) {
      throw new Error(`Error al obtener estadísticas de viajes: ${error.message}`);
    }
  }

  /**
   * Buscar viajes con filtros avanzados y agregaciones
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} Resultado con viajes y paginación
   */
  async findWithAdvancedFilters(filters = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = options;
      const matchStage = {};

      // Construir filtros de manera eficiente
      if (filters.status) {
        // Mapear estado de inglés a español
        const statusMap = {
          requested: 'pendiente',
          accepted: 'asignado',
          driver_arrived: 'en_curso',
          in_progress: 'en_curso',
          completed: 'completado',
          cancelled: 'cancelado',
        };
        matchStage.estado = statusMap[filters.status] || filters.status;
      }

      if (filters.passengerId) {
        matchStage.pasajero = filters.passengerId;
      }

      if (filters.driverId) {
        // Si driverId es el ID del User, necesitamos buscar el Driver document
        // Por ahora, asumimos que puede ser tanto User ID como Driver ID
        matchStage.conductor = filters.driverId;
      }

      if (filters.paymentMethod) {
        matchStage.metodoPago = filters.paymentMethod;
      }

      if (filters.minFare || filters.maxFare) {
        matchStage.tarifa = {};
        if (filters.minFare) {
          matchStage.tarifa.$gte = filters.minFare;
        }
        if (filters.maxFare) {
          matchStage.tarifa.$lte = filters.maxFare;
        }
      }

      if (filters.dateFrom || filters.dateTo) {
        matchStage.createdAt = {};
        if (filters.dateFrom) {
          matchStage.createdAt.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          matchStage.createdAt.$lte = new Date(filters.dateTo);
        }
      }

      const pipeline = [
        { $match: matchStage },
        {
          $lookup: {
            from: 'users',
            localField: 'pasajero',
            foreignField: '_id',
            as: 'passenger',
            pipeline: [{ $project: { name: 1, lastname: 1, email: 1, phone: 1 } }],
          },
        },
        {
          $lookup: {
            from: 'drivers',
            localField: 'conductor',
            foreignField: '_id',
            as: 'driver',
            pipeline: [
              { $project: { name: 1, lastname: 1, email: 1, phone: 1, rating: 1, user: 1 } },
              {
                $lookup: {
                  from: 'users',
                  localField: 'user',
                  foreignField: '_id',
                  as: 'user',
                  pipeline: [{ $project: { _id: 1 } }],
                },
              },
              { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            ],
          },
        },
        { $unwind: { path: '$passenger', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$driver', preserveNullAndEmptyArrays: true } },
        { $sort: { [sortBy]: sortOrder } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ];

      const [trips, total] = await Promise.all([
        Trip.aggregate(pipeline),
        Trip.countDocuments(matchStage),
      ]);

      return {
        trips: trips.map(trip => this.toEntity(trip)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error al buscar viajes con filtros avanzados: ${error.message}`);
    }
  }

  /**
   * Buscar viajes con paginación optimizada usando cursor
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Object>} Resultado con viajes y cursor
   */
  async findWithCursor(options = {}) {
    try {
      const { limit = 10, cursor, sortBy = 'createdAt', sortOrder = -1, status } = options;
      const query = {};

      if (status) {
        query.status = status;
      }

      if (cursor) {
        if (sortOrder === -1) {
          query[sortBy] = { $lt: new Date(cursor) };
        } else {
          query[sortBy] = { $gt: new Date(cursor) };
        }
      }

      const trips = await Trip.find(query)
        .populate('pasajero', 'name lastname email phone')
        .populate({
          path: 'conductor',
          select: 'name lastname email phone rating',
          model: 'Driver',
          populate: {
            path: 'user',
            select: '_id',
          },
        })
        .sort({ [sortBy]: sortOrder })
        .limit(limit + 1); // +1 para determinar si hay más páginas

      const hasNextPage = trips.length > limit;
      if (hasNextPage) {
        trips.pop(); // Remover el último elemento si hay más páginas
      }

      const nextCursor = hasNextPage ? trips[trips.length - 1][sortBy] : null;

      return {
        trips: trips.map(trip => this.toEntity(trip)),
        hasNextPage,
        nextCursor,
      };
    } catch (error) {
      throw new Error(`Error al buscar viajes con cursor: ${error.message}`);
    }
  }

  /**
   * Convertir documento de MongoDB a entidad de dominio
   */
  toEntity(tripDoc) {
    if (!tripDoc) return null;

    // Mapear estados de español a inglés
    const statusMap = {
      pendiente: 'requested',
      asignado: 'accepted',
      en_curso: 'in_progress',
      finalizado: 'completed',
      completado: 'completed',
      cancelado: 'cancelled',
    };

    // Manejar passengerId(puede ser ObjectId, objeto poblado, o resultado de agregación)
    let passengerId = tripDoc.pasajero || tripDoc.passenger;
    if (passengerId && typeof passengerId === 'object' && passengerId._id) {
      passengerId = passengerId._id.toString();
    } else if (passengerId && typeof passengerId === 'object') {
      passengerId = passengerId.toString();
    }

    // Manejar driverId/conductor (puede ser ObjectId, objeto poblado,
    // resultado de agregación o null)
    // Si conductor está poblado y tiene user, usar el ID del user
    // Si no tiene user poblado, intentar obtenerlo del Driver
    let driverId = tripDoc.conductor || tripDoc.driver;
    if (driverId && typeof driverId === 'object') {
      // Si es resultado de agregación con user anidado
      if (driverId.user) {
        driverId = driverId.user._id ? driverId.user._id.toString() : driverId.user.toString();
      } else if (driverId._id) {
        // Si solo tiene _id, es el Driver ID(no poblado)
        // En este caso, mantener el ID del Driver y el método que llama
        // deberá hacer populate anidado o buscar el user por separado
        driverId = driverId._id.toString();
      } else {
        driverId = driverId.toString();
      }
    } else if (driverId) {
      driverId = driverId.toString();
    }

    return new TripEntity({
      id: tripDoc._id.toString(),
      passengerId,
      driverId: driverId || null,
      origin: tripDoc.origen,
      destination: tripDoc.destino,
      status: statusMap[tripDoc.estado] || tripDoc.estado,
      fare: tripDoc.tarifa,
      distance: tripDoc.distancia_km,
      duration: tripDoc.duracion_min,
      paymentMethod: tripDoc.metodoPago,
      createdAt: tripDoc.creadoEn,
      updatedAt: tripDoc.updatedAt,
    });
  }

  /**
   * Convertir entidad de dominio a modelo de Mongoose
   */
  fromEntity(tripEntity) {
    if (!tripEntity) return null;

    // Mapear estados de inglés a español
    const statusMap = {
      requested: 'pendiente',
      accepted: 'asignado',
      driver_arrived: 'en_curso',
      in_progress: 'en_curso',
      completed: 'completado',
      cancelled: 'cancelado',
    };

    return {
      pasajero: tripEntity.passengerId,
      conductor: tripEntity.driverId,
      origen: tripEntity.origin,
      destino: tripEntity.destination,
      estado: statusMap[tripEntity.status] || tripEntity.status,
      tarifa: tripEntity.fare,
      distancia_km: tripEntity.distance,
      duracion_min: tripEntity.duration,
      metodoPago: tripEntity.paymentMethod,
      creadoEn: tripEntity.createdAt,
    };
  }
}

module.exports = { TripRepository };
