const User = require('../models/User');
const UserEntity = require('../domain/entities/User');

/**
 * Repository para operaciones de User
 * Abstrae el acceso a la base de datos y proporciona métodos para operaciones CRUD
 *
 * @class UserRepository
 * @description Maneja todas las operaciones de base de datos relacionadas con usuarios
 */
class UserRepository {
  /**
   * Crear un nuevo usuario en la base de datos
   * @param {Object} userData - Datos del usuario a crear
   * @param {string} userData.name - Nombre del usuario
   * @param {string} userData.lastname - Apellido del usuario
   * @param {string} userData.email - Email del usuario
   * @param {string} userData.password - Contraseña hasheada del usuario
   * @param {string} userData.phone - Teléfono del usuario
   * @param {string} userData.role - Rol del usuario
   * @param {boolean} [userData.isActive=true] - Estado activo del usuario
   * @returns {Promise<UserEntity>} Entidad de usuario creada
   * @throws {Error} Si hay error al crear el usuario
   */
  async create(userData) {
    try {
      const user = new User(userData);
      const savedUser = await user.save();
      return this.toEntity(savedUser);
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  /**
   * Buscar usuario por ID
   * @param {string} id - ID del usuario a buscar
   * @returns {Promise<UserEntity|null>} Entidad de usuario encontrada o null
   * @throws {Error} Si hay error al buscar el usuario
   */
  async findById(id) {
    try {
      const user = await User.findById(id).select('-password');
      return user ? this.toEntity(user) : null;
    } catch (error) {
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return user ? this.toEntity(user) : null;
    } catch (error) {
      throw new Error(`Error al buscar usuario por email: ${error.message}`);
    }
  }

  /**
   * Buscar usuario por email(incluyendo password para autenticación)
   */
  async findByEmailWithPassword(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return user;
    } catch (error) {
      throw new Error(`Error al buscar usuario con password: ${error.message}`);
    }
  }

  /**
   * Buscar usuarios por rol
   */
  async findByRole(role, options = {}) {
    try {
      const { page = 1, limit = 10, isActive } = options;
      const query = { role };

      if (isActive !== undefined) {
        query.isActive = isActive;
      }

      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await User.countDocuments(query);

      return {
        users: users.map(user => this.toEntity(user)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error al buscar usuarios por rol: ${error.message}`);
    }
  }

  /**
   * Buscar conductores activos
   */
  async findActiveDrivers() {
    try {
      const drivers = await User.find({
        role: 'conductor',
        isActive: true,
      }).select('-password');

      return drivers.map(driver => this.toEntity(driver));
    } catch (error) {
      throw new Error(`Error al buscar conductores activos: ${error.message}`);
    }
  }

  /**
   * Actualizar usuario
   */
  async update(id, updateData) {
    try {
      // Remover password del updateData si está presente
      // eslint-disable-next-line no-unused-vars
      const { password: _password, ...safeUpdateData } = updateData;

      const user = await User.findByIdAndUpdate(
        id,
        { ...safeUpdateData, updatedAt: new Date() },
        { new: true, runValidators: true },
      ).select('-password');

      return user ? this.toEntity(user) : null;
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  /**
   * Actualizar password del usuario
   */
  async updatePassword(id, hashedPassword) {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { password: hashedPassword, updatedAt: new Date() },
        { new: true },
      ).select('-password');

      return user ? this.toEntity(user) : null;
    } catch (error) {
      throw new Error(`Error al actualizar password: ${error.message}`);
    }
  }

  /**
   * Eliminar usuario(soft delete)
   */
  async delete(id) {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: new Date() },
        { new: true },
      ).select('-password');

      return user ? this.toEntity(user) : null;
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }

  /**
   * Verificar si el email ya existe
   */
  async emailExists(email, excludeId = null) {
    try {
      const query = { email: email.toLowerCase() };
      if (excludeId) {
        query._id = { $ne: excludeId };
      }

      const user = await User.findOne(query);
      return !!user;
    } catch (error) {
      throw new Error(`Error al verificar email: ${error.message}`);
    }
  }

  /**
   * Buscar usuarios con filtros avanzados y optimizaciones
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} options - Opciones de paginación y ordenamiento
   * @returns {Promise<Object>} Resultado con usuarios y paginación
   */
  async findWithFilters(filters = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = options;
      const query = {};

      // Construir query de manera eficiente
      if (filters.role) {
        query.role = filters.role;
      }

      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      if (filters.search) {
        // Usar índice de texto si está disponible, sino regex optimizado
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { lastname: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
        ];
      }

      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) {
          query.createdAt.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          query.createdAt.$lte = new Date(filters.dateTo);
        }
      }

      // Usar aggregate para mejor rendimiento en consultas complejas
      const pipeline = [
        { $match: query },
        { $project: { password: 0 } }, // Excluir password
        { $sort: { [sortBy]: sortOrder } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ];

      const [users, total] = await Promise.all([
        User.aggregate(pipeline),
        User.countDocuments(query),
      ]);

      return {
        users: users.map(user => this.toEntity(user)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error al buscar usuarios con filtros: ${error.message}`);
    }
  }

  /**
   * Buscar usuarios por múltiples IDs de manera eficiente
   * @param {Array<string>} userIds - Array de IDs de usuarios
   * @returns {Promise<Array<UserEntity>>} Array de entidades de usuario
   */
  async findByIds(userIds) {
    try {
      const users = await User.find({ _id: { $in: userIds } })
        .select('-password')
        .lean(); // Usar lean() para mejor rendimiento

      return users.map(user => this.toEntity(user));
    } catch (error) {
      throw new Error(`Error al buscar usuarios por IDs: ${error.message}`);
    }
  }

  /**
   * Buscar conductores disponibles(activos y sin viajes en progreso)
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Array<UserEntity>>} Array de conductores disponibles
   */
  async findAvailableDrivers(options = {}) {
    try {
      const { limit = 10, location } = options;

      // Query base para conductores activos
      const query = {
        role: 'conductor',
        isActive: true,
      };

      // Si se proporciona ubicación, agregar filtro de proximidad
      if (location && location.latitude && location.longitude) {
        query.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [location.longitude, location.latitude],
            },
            $maxDistance: 10000, // 10km en metros
          },
        };
      }

      const drivers = await User.find(query).select('-password').limit(limit).lean();

      return drivers.map(driver => this.toEntity(driver));
    } catch (error) {
      throw new Error(`Error al buscar conductores disponibles: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de usuarios
   * @param {Object} filters - Filtros para las estadísticas
   * @returns {Promise<Object>} Estadísticas de usuarios
   */
  async getUserStats(filters = {}) {
    try {
      const matchStage = {};

      if (filters.role) {
        matchStage.role = filters.role;
      }

      if (filters.isActive !== undefined) {
        matchStage.isActive = filters.isActive;
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
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
            passengers: { $sum: { $cond: [{ $eq: ['$role', 'pasajero'] }, 1, 0] } },
            drivers: { $sum: { $cond: [{ $eq: ['$role', 'conductor'] }, 1, 0] } },
            admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          },
        },
      ];

      const result = await User.aggregate(pipeline);
      return (
        result[0] || {
          total: 0,
          active: 0,
          inactive: 0,
          passengers: 0,
          drivers: 0,
          admins: 0,
        }
      );
    } catch (error) {
      throw new Error(`Error al obtener estadísticas de usuarios: ${error.message}`);
    }
  }

  /**
   * Buscar usuarios con paginación optimizada usando cursor
   * @param {Object} options - Opciones de búsqueda
   * @returns {Promise<Object>} Resultado con usuarios y cursor
   */
  async findWithCursor(options = {}) {
    try {
      const { limit = 10, cursor, sortBy = 'createdAt', sortOrder = -1 } = options;
      const query = {};

      if (cursor) {
        if (sortOrder === -1) {
          query[sortBy] = { $lt: new Date(cursor) };
        } else {
          query[sortBy] = { $gt: new Date(cursor) };
        }
      }

      const users = await User.find(query)
        .select('-password')
        .sort({ [sortBy]: sortOrder })
        .limit(limit + 1); // +1 para determinar si hay más páginas

      const hasNextPage = users.length > limit;
      if (hasNextPage) {
        users.pop(); // Remover el último elemento si hay más páginas
      }

      const nextCursor = hasNextPage ? users[users.length - 1][sortBy] : null;

      return {
        users: users.map(user => this.toEntity(user)),
        hasNextPage,
        nextCursor,
      };
    } catch (error) {
      throw new Error(`Error al buscar usuarios con cursor: ${error.message}`);
    }
  }

  /**
   * Convertir documento de MongoDB a entidad de dominio
   */
  toEntity(userDoc) {
    if (!userDoc) return null;

    return new UserEntity({
      id: userDoc._id.toString(),
      nombre: userDoc.nombre,
      apellido: userDoc.apellido,
      email: userDoc.email,
      telefono: userDoc.telefono,
      role: userDoc.role,
      activo: userDoc.activo,
      avatar: userDoc.avatar,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    });
  }
}

module.exports = { UserRepository };
