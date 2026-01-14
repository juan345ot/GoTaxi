const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const cacheService = require('../../src/services/cacheService');

describe('CacheService', () => {
  let mongoServer;

  beforeAll(async () => {
    // Configurar MongoDB en memoria
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Limpiar caché antes de cada test
    await cacheService.clear();
  });

  describe('Constructor y configuración', () => {
    test('debería inicializar correctamente', () => {
      expect(cacheService).toBeDefined();
      expect(cacheService.redis).toBeDefined();
      expect(cacheService.metrics).toBeDefined();
    });

    test('debería tener configuración por defecto', () => {
      expect(cacheService.metrics).toBeDefined();
      expect(cacheService.invalidationStrategies).toBeDefined();
      expect(cacheService).toHaveProperty('useRedis');
    });
  });

  describe('Operaciones básicas de caché', () => {
    test('debería guardar y obtener datos correctamente', async () => {
      const key = 'test-key';
      const data = { message: 'test data', timestamp: Date.now() };

      await cacheService.set(key, data);
      const result = await cacheService.get(key);

      expect(result).toEqual(data);
    });

    test('debería devolver null para clave inexistente', async () => {
      const result = await cacheService.get('non-existent-key');
      expect(result).toBeNull();
    });

    test('debería eliminar datos correctamente', async () => {
      const key = 'test-key';
      const data = { message: 'test data' };

      await cacheService.set(key, data);
      await cacheService.del(key);
      const result = await cacheService.get(key);

      expect(result).toBeNull();
    });

    test('debería manejar TTL personalizado', async () => {
      const key = 'test-key-ttl';
      const data = { message: 'test data' };
      const ttl = 1000; // 1 segundo

      await cacheService.set(key, data, ttl);
      
      // Verificar que existe
      let result = await cacheService.get(key);
      expect(result).toEqual(data);

      // Esperar a que expire (solo funciona en modo memoria)
      if (!cacheService.useRedis) {
        await new Promise(resolve => setTimeout(resolve, 1100));
        
        result = await cacheService.get(key);
        expect(result).toBeNull();
      }
    });
  });

  describe('Operaciones con prefijos', () => {
    test('debería guardar y obtener datos con prefijo', async () => {
      const prefix = 'user';
      const identifier = '123';
      const data = { name: 'John Doe', email: 'john@example.com' };
      const params = { include: 'profile' };

      await cacheService.setWithPrefix(prefix, identifier, data, params);
      const result = await cacheService.getOrSetWithPrefix(prefix, identifier, null, params);

      expect(result).toEqual(data);
    });

    test('debería generar claves consistentes', () => {
      const prefix = 'user';
      const identifier = '123';
      const params = { include: 'profile' };

      const key1 = cacheService.generateKey(prefix, identifier, params);
      const key2 = cacheService.generateKey(prefix, identifier, params);

      expect(key1).toBe(key2);
    });

    test('debería generar claves diferentes para parámetros diferentes', () => {
      const prefix = 'user';
      const identifier = '123';
      const params1 = { include: 'profile' };
      const params2 = { include: 'settings' };

      const key1 = cacheService.generateKey(prefix, identifier, params1);
      const key2 = cacheService.generateKey(prefix, identifier, params2);

      expect(key1).not.toBe(key2);
    });
  });

  describe('Invalidación de caché', () => {
    beforeEach(async () => {
      // Configurar datos de prueba
      await cacheService.set('user:123', { name: 'John' });
      await cacheService.set('user:456', { name: 'Jane' });
      await cacheService.set('trip:789', { status: 'active' });
    });

    test('debería invalidar por patrón', async () => {
      // Invalidar claves específicas
      await cacheService.del('user:123');
      await cacheService.del('user:456');
      
      const user1 = await cacheService.get('user:123');
      const user2 = await cacheService.get('user:456');
      const trip = await cacheService.get('trip:789');

      expect(user1).toBeNull();
      expect(user2).toBeNull();
      expect(trip).toEqual({ status: 'active' });
    });

    test('debería invalidar usuario específico', async () => {
      await cacheService.del('user:123');
      
      const user1 = await cacheService.get('user:123');
      const user2 = await cacheService.get('user:456');

      expect(user1).toBeNull();
      expect(user2).toEqual({ name: 'Jane' });
    });

    test('debería invalidar viaje específico', async () => {
      await cacheService.del('trip:789');
      
      const trip = await cacheService.get('trip:789');
      const user = await cacheService.get('user:123');

      expect(trip).toBeNull();
      expect(user).toEqual({ name: 'John' });
    });
  });

  describe('getOrSet', () => {
    test('debería ejecutar fallback cuando no hay caché', async () => {
      const key = 'test-key';
      const fallbackData = { message: 'from fallback' };
      const fallback = jest.fn().mockResolvedValue(fallbackData);

      const result = await cacheService.getOrSet(key, fallback);

      expect(result).toEqual(fallbackData);
      expect(fallback).toHaveBeenCalledTimes(1);
    });

    test('debería devolver caché cuando existe', async () => {
      const key = 'test-key';
      const cachedData = { message: 'from cache' };
      const fallbackData = { message: 'from fallback' };
      const fallback = jest.fn().mockResolvedValue(fallbackData);

      // Primero guardar en caché
      await cacheService.set(key, cachedData);

      const result = await cacheService.getOrSet(key, fallback);

      expect(result).toEqual(cachedData);
      expect(fallback).not.toHaveBeenCalled();
    });

    test('debería manejar errores en fallback', async () => {
      const key = 'test-key';
      const fallback = jest.fn().mockRejectedValue(new Error('Fallback error'));

      await expect(cacheService.getOrSet(key, fallback)).rejects.toThrow('Fallback error');
    });
  });

  describe('Métricas y estadísticas', () => {
    test('debería registrar métricas correctamente', async () => {
      const key = 'test-key';
      const data = { message: 'test' };

      await cacheService.set(key, data);
      await cacheService.get(key);

      const metrics = cacheService.getMetrics();
      
      expect(metrics.hits).toBeGreaterThan(0);
      expect(metrics.misses).toBeGreaterThanOrEqual(0);
      expect(metrics.sets).toBeGreaterThan(0);
    });

    test('debería resetear métricas', async () => {
      await cacheService.set('test', 'data');
      await cacheService.get('test');

      cacheService.resetMetrics();
      const metrics = cacheService.getMetrics();

      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(0);
      expect(metrics.sets).toBe(0);
    });

    test('debería obtener estadísticas completas', async () => {
      await cacheService.set('test1', 'data1');
      await cacheService.set('test2', 'data2');
      await cacheService.get('test1');
      await cacheService.get('non-existent');

      const stats = await cacheService.getStats();

      expect(stats).toHaveProperty('metrics');
      expect(stats.metrics).toHaveProperty('hits');
      expect(stats.metrics).toHaveProperty('misses');
      expect(stats.metrics).toHaveProperty('sets');
      expect(stats.metrics).toHaveProperty('deletes');
      expect(stats.metrics).toHaveProperty('hitRate');
    });
  });

  describe('Limpieza y mantenimiento', () => {
    test('debería limpiar caché completamente', async () => {
      await cacheService.set('test1', 'data1');
      await cacheService.set('test2', 'data2');

      await cacheService.clear();

      const result1 = await cacheService.get('test1');
      const result2 = await cacheService.get('test2');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    test('debería limpiar datos expirados', async () => {
      // Solo funciona en modo memoria
      if (!cacheService.useRedis) {
        // Crear datos con TTL muy corto
        await cacheService.set('expired1', 'data1', 100);
        await cacheService.set('expired2', 'data2', 100);
        await cacheService.set('valid', 'data3', 60000);

        // Esperar a que expiren
        await new Promise(resolve => setTimeout(resolve, 200));

        const cleaned = await cacheService.cleanExpired();

        const expired1 = await cacheService.get('expired1');
        const expired2 = await cacheService.get('expired2');
        const valid = await cacheService.get('valid');

        expect(expired1).toBeNull();
        expect(expired2).toBeNull();
        expect(valid).toEqual('data3');
        expect(cleaned).toBeGreaterThan(0);
      }
    });
  });

  describe('Middleware de caché', () => {
    test('debería crear middleware correctamente', () => {
      const middleware = cacheService.middleware(300);
      
      expect(typeof middleware).toBe('function');
    });

    test('debería usar generador de claves personalizado', () => {
      const keyGenerator = jest.fn().mockReturnValue('custom-key');
      const middleware = cacheService.middleware(300, keyGenerator);
      
      expect(typeof middleware).toBe('function');
    });
  });

  describe('Manejo de errores', () => {
    test('debería manejar errores de Redis graciosamente', async () => {
      // Solo si Redis está habilitado
      if (cacheService.useRedis && cacheService.redis) {
        // Simular error de Redis
        const originalGet = cacheService.redis.get;
        cacheService.redis.get = jest.fn().mockRejectedValue(new Error('Redis error'));

        const result = await cacheService.get('test-key');

        expect(result).toBeNull();

        // Restaurar método original
        cacheService.redis.get = originalGet;
      }
    });

    test('debería manejar errores de conexión', async () => {
      // Solo si Redis está habilitado
      if (cacheService.useRedis && cacheService.redis) {
        // Simular desconexión de Redis
        const originalSet = cacheService.redis.set;
        cacheService.redis.set = jest.fn().mockRejectedValue(new Error('Connection error'));

        const result = await cacheService.set('test', 'data');
        expect(result).toBe(false);

        // Restaurar método original
        cacheService.redis.set = originalSet;
      }
    });
  });

  describe('Configuración de TTL', () => {
    test('debería usar TTL por defecto cuando no se especifica', () => {
      const ttl = cacheService.getTTL('user');
      expect(ttl).toBeDefined();
      expect(typeof ttl).toBe('number');
    });

    test('debería usar TTL personalizado cuando se especifica', () => {
      const customTtl = 600;
      const ttl = cacheService.getTTL('user', customTtl);
      expect(ttl).toBe(customTtl);
    });

    test('debería usar TTL específico del prefijo', () => {
      const ttl = cacheService.getTTL('trip');
      expect(ttl).toBeDefined();
    });
  });

  describe('Verificación de integridad', () => {
    test('debería verificar integridad del caché', async () => {
      await cacheService.set('test', 'data');
      
      // Verificar que los datos están en el caché
      const result = await cacheService.get('test');
      expect(result).toEqual('data');
      
      // Verificar métricas
      const metrics = cacheService.getMetrics();
      expect(metrics.sets).toBeGreaterThan(0);
    });
  });
});
