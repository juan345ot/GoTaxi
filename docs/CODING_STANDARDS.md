# 📏 Estándares de Código - GoTaxi

Esta guía establece los estándares de código que todos los contribuidores deben seguir para mantener la consistencia y calidad del proyecto.

## 📋 Tabla de Contenidos

- [JavaScript/TypeScript](#-javascripttypescript)
- [React/React Native](#-reactreact-native)
- [CSS/Styling](#-cssstyling)
- [Git](#-git)
- [Testing](#-testing)
- [Documentación](#-documentación)
- [Performance](#-performance)
- [Seguridad](#-seguridad)

## 🟨 JavaScript/TypeScript

### Naming Conventions

#### Variables y Funciones

```javascript
// ✅ Correcto - camelCase
const userName = "juan";
const isUserActive = true;
const calculateTotalPrice = (items) => {
  /* ... */
};

// ❌ Incorrecto
const username = "juan";
const is_user_active = true;
const calculate_total_price = (items) => {
  /* ... */
};
```

#### Constantes

```javascript
// ✅ Correcto - UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = "https://api.gotaxi.com";
const DEFAULT_TIMEOUT = 5000;

// ❌ Incorrecto
const maxRetryAttempts = 3;
const apiBaseUrl = "https://api.gotaxi.com";
```

#### Clases

```javascript
// ✅ Correcto - PascalCase
class UserService {
  constructor() {
    this.repository = new UserRepository();
  }
}

// ❌ Incorrecto
class userService {
  constructor() {
    this.repository = new userRepository();
  }
}
```

#### Interfaces y Types (TypeScript)

```typescript
// ✅ Correcto - PascalCase
interface UserData {
  id: string;
  name: string;
  email: string;
}

type PaymentMethod = "cash" | "card" | "mercadopago";

// ❌ Incorrecto
interface userData {
  id: string;
  name: string;
  email: string;
}
```

### Function Declarations

#### Arrow Functions (Preferido)

```javascript
// ✅ Correcto
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ✅ Correcto - Una línea
const formatPrice = (price) => `$${price.toFixed(2)}`;

// ❌ Incorrecto
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

#### Async/Await (Preferido)

```javascript
// ✅ Correcto
const fetchUserData = async (userId) => {
  try {
    const response = await userApi.getUser(userId);
    return response.data;
  } catch (error) {
    logger.error("Error fetching user:", error);
    throw error;
  }
};

// ❌ Incorrecto
const fetchUserData = (userId) => {
  return userApi
    .getUser(userId)
    .then((response) => response.data)
    .catch((error) => {
      logger.error("Error fetching user:", error);
      throw error;
    });
};
```

### Error Handling

#### Try-Catch con Logging

```javascript
// ✅ Correcto
const processPayment = async (paymentData) => {
  try {
    const result = await paymentService.process(paymentData);
    logger.info("Payment processed successfully:", result.id);
    return { success: true, data: result };
  } catch (error) {
    logger.error("Payment processing failed:", {
      error: error.message,
      paymentData: paymentData.id,
      userId: paymentData.userId,
    });
    return { success: false, error: error.message };
  }
};

// ❌ Incorrecto
const processPayment = async (paymentData) => {
  try {
    const result = await paymentService.process(paymentData);
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
```

#### Validation Errors

```javascript
// ✅ Correcto
const validateUserData = (userData) => {
  const errors = [];

  if (!userData.email || !isValidEmail(userData.email)) {
    errors.push("Email is required and must be valid");
  }

  if (!userData.password || userData.password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ❌ Incorrecto
const validateUserData = (userData) => {
  if (!userData.email) {
    throw new Error("Email is required");
  }
  if (!userData.password) {
    throw new Error("Password is required");
  }
  return true;
};
```

### Object and Array Handling

#### Destructuring

```javascript
// ✅ Correcto
const { name, email, phone } = user;
const [firstItem, secondItem, ...restItems] = items;

// ❌ Incorrecto
const name = user.name;
const email = user.email;
const phone = user.phone;
```

#### Spread Operator

```javascript
// ✅ Correcto
const updatedUser = { ...user, name: "New Name" };
const allItems = [...existingItems, ...newItems];

// ❌ Incorrecto
const updatedUser = Object.assign({}, user, { name: "New Name" });
const allItems = existingItems.concat(newItems);
```

#### Array Methods

```javascript
// ✅ Correcto
const activeUsers = users.filter((user) => user.isActive);
const userNames = users.map((user) => user.name);
const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

// ❌ Incorrecto
const activeUsers = [];
for (let i = 0; i < users.length; i++) {
  if (users[i].isActive) {
    activeUsers.push(users[i]);
  }
}
```

## ⚛️ React/React Native

### Component Structure

#### Functional Components (Preferido)

```jsx
// ✅ Correcto
import React, { useState, useEffect, memo } from "react";
import { View, Text, StyleSheet } from "react-native";

const UserProfile = memo(({ userId, onUpdate }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await userApi.getUser(userId);
        setUser(userData);
      } catch (error) {
        logger.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.name}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default UserProfile;
```

#### Props Destructuring

```jsx
// ✅ Correcto
const TripCard = ({ trip, onPress, onCancel }) => {
  return (
    <TouchableOpacity onPress={() => onPress(trip.id)}>
      <Text>
        {trip.origin} → {trip.destination}
      </Text>
    </TouchableOpacity>
  );
};

// ❌ Incorrecto
const TripCard = (props) => {
  return (
    <TouchableOpacity onPress={() => props.onPress(props.trip.id)}>
      <Text>
        {props.trip.origin} → {props.trip.destination}
      </Text>
    </TouchableOpacity>
  );
};
```

### Hooks

#### Custom Hooks

```jsx
// ✅ Correcto
const useUserData = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await userApi.getUser(userId);
        setUser(userData);
      } catch (err) {
        setError(err.message);
        logger.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const refetch = useCallback(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  return { user, loading, error, refetch };
};
```

#### useCallback y useMemo

```jsx
// ✅ Correcto
const TripList = ({ trips, onTripPress }) => {
  const handleTripPress = useCallback(
    (tripId) => {
      onTripPress(tripId);
    },
    [onTripPress]
  );

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => trip.status === "active");
  }, [trips]);

  return (
    <FlatList
      data={filteredTrips}
      renderItem={({ item }) => (
        <TripItem trip={item} onPress={handleTripPress} />
      )}
    />
  );
};

// ❌ Incorrecto
const TripList = ({ trips, onTripPress }) => {
  const handleTripPress = (tripId) => {
    onTripPress(tripId);
  };

  const filteredTrips = trips.filter((trip) => trip.status === "active");

  return (
    <FlatList
      data={filteredTrips}
      renderItem={({ item }) => (
        <TripItem trip={item} onPress={handleTripPress} />
      )}
    />
  );
};
```

### State Management

#### Context API

```jsx
// ✅ Correcto
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const result = await authService.login(email, password);
      if (result.success) {
        setUser(result.data.user);
        await secureStorage.setItem("user", result.data.user);
      }
      return result;
    } catch (error) {
      logger.error("Login error:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout: () => setUser(null),
    }),
    [user, loading, login]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

## 🎨 CSS/Styling

### Tailwind CSS (Panel Admin)

#### Utility Classes

```jsx
// ✅ Correcto
<div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h2 className="text-xl font-bold text-gray-800 mb-2">Trip Details</h2>
  <p className="text-gray-600 text-center leading-relaxed">
    From {trip.origin} to {trip.destination}
  </p>
</div>

// ❌ Incorrecto
<div style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
}}>
  <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Trip Details</h2>
</div>
```

#### Responsive Design

```jsx
// ✅ Correcto
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="p-4 bg-blue-50 rounded-lg">
    <h3 className="text-lg font-semibold text-blue-900">Total Trips</h3>
    <p className="text-2xl font-bold text-blue-600">{totalTrips}</p>
  </div>
</div>

// ❌ Incorrecto
<div className="grid-cols-3">
  <div className="p-4 bg-blue-50 rounded-lg">
    <h3>Total Trips</h3>
    <p>{totalTrips}</p>
  </div>
</div>
```

### React Native Styles

#### StyleSheet

```jsx
// ✅ Correcto
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
  },
});

// ❌ Incorrecto
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
```

#### Dynamic Styles

```jsx
// ✅ Correcto
const TripCard = ({ trip, isSelected }) => {
  const cardStyle = [styles.card, isSelected && styles.selectedCard];

  return (
    <TouchableOpacity style={cardStyle}>
      <Text style={styles.tripText}>
        {trip.origin} → {trip.destination}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  selectedCard: {
    borderColor: "#007AFF",
    backgroundColor: "#F0F8FF",
  },
  tripText: {
    fontSize: 16,
    color: "#333333",
  },
});
```

## 🔧 Git

### Commit Messages

#### Conventional Commits

```bash
# ✅ Correcto
feat: agregar sistema de notificaciones push
fix: corregir error de validación en formulario de registro
docs: actualizar documentación de API
style: aplicar formato de código con Prettier
refactor: extraer lógica de validación a utilidad separada
test: agregar tests para servicio de autenticación
chore: actualizar dependencias de desarrollo
perf: optimizar renderizado de lista de viajes
ci: configurar GitHub Actions para tests automáticos

# ❌ Incorrecto
agregar notificaciones
fix
actualizar docs
cambios
wip
asdf
```

#### Commit Message Format

```bash
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Examples

```bash
feat(auth): agregar autenticación con refresh tokens

- Implementar generación de refresh tokens
- Agregar endpoint para renovar tokens
- Actualizar middleware de autenticación

Closes #123

fix(payment): corregir error en procesamiento de pagos

El error ocurría cuando el monto era 0. Ahora se valida
que el monto sea mayor a 0 antes de procesar.

Fixes #456
```

### Branch Naming

```bash
# ✅ Correcto
feature/user-authentication
feature/payment-integration
fix/login-validation-error
fix/memory-leak-in-map-component
docs/api-documentation
chore/update-dependencies
hotfix/critical-security-patch

# ❌ Incorrecto
new-feature
fix
update
changes
branch1
test
```

### Pull Request

#### PR Title

```bash
# ✅ Correcto
feat: agregar sistema de notificaciones push
fix: corregir error de validación en formulario
docs: actualizar documentación de API

# ❌ Incorrecto
agregar notificaciones
fix
actualizar docs
```

#### PR Description

```markdown
## Descripción

Agrega sistema de notificaciones push para notificar a los conductores sobre nuevos viajes disponibles.

## Tipo de Cambio

- [x] New feature (cambio que agrega funcionalidad)
- [ ] Bug fix (cambio que corrige un problema)
- [ ] Breaking change (cambio que rompe compatibilidad)
- [ ] Documentation update (actualización de documentación)

## Cómo Probar

1. Iniciar sesión como conductor
2. Solicitar un viaje como pasajero
3. Verificar que el conductor reciba la notificación

## Screenshots

[Agregar capturas de pantalla si aplica]

## Checklist

- [x] Mi código sigue los estándares del proyecto
- [x] He realizado una auto-revisión de mi código
- [x] He comentado mi código donde sea necesario
- [x] Mis cambios no generan warnings
- [x] He agregado tests que prueban mi fix/feature
- [x] Los tests nuevos y existentes pasan localmente
```

## 🧪 Testing

### Unit Tests

#### Jest/React Native Testing Library

```javascript
// ✅ Correcto
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { UserProfile } from "../UserProfile";

describe("UserProfile", () => {
  const mockUser = {
    id: "1",
    name: "Juan",
    lastname: "Pérez",
    email: "juan@example.com",
  };

  it("should render user information correctly", () => {
    const { getByText } = render(<UserProfile user={mockUser} />);

    expect(getByText("Juan Pérez")).toBeTruthy();
    expect(getByText("juan@example.com")).toBeTruthy();
  });

  it("should call onEdit when edit button is pressed", async () => {
    const onEdit = jest.fn();
    const { getByTestId } = render(
      <UserProfile user={mockUser} onEdit={onEdit} />
    );

    fireEvent.press(getByTestId("edit-button"));

    expect(onEdit).toHaveBeenCalledWith(mockUser.id);
  });

  it("should show loading state when user is null", () => {
    const { getByTestId } = render(<UserProfile user={null} />);

    expect(getByTestId("loading-spinner")).toBeTruthy();
  });
});
```

#### Service Tests

```javascript
// ✅ Correcto
import { AuthService } from "../AuthService";
import { UserRepository } from "../UserRepository";

describe("AuthService", () => {
  let authService;
  let mockUserRepository;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    authService = new AuthService(mockUserRepository);
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        password: "hashedPassword",
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(authService, "verifyPassword").mockResolvedValue(true);
      jest.spyOn(authService, "generateToken").mockReturnValue("mock-token");

      const result = await authService.login("test@example.com", "password");

      expect(result.success).toBe(true);
      expect(result.data.token).toBe("mock-token");
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
    });

    it("should fail login with invalid credentials", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const result = await authService.login(
        "test@example.com",
        "wrong-password"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Credenciales inválidas");
    });
  });
});
```

### Integration Tests

```javascript
// ✅ Correcto
import request from "supertest";
import app from "../app";

describe("Auth API", () => {
  describe("POST /api/auth/login", () => {
    it("should login successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(userData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
    });

    it("should fail with invalid credentials", async () => {
      const userData = {
        email: "test@example.com",
        password: "wrong-password",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(userData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Credenciales inválidas");
    });
  });
});
```

## 📚 Documentación

### JSDoc Comments

```javascript
// ✅ Correcto
/**
 * Calcula el precio total de un viaje basado en la distancia y tarifa base
 * @param {number} distance - Distancia en kilómetros
 * @param {number} baseRate - Tarifa base por kilómetro
 * @param {Object} options - Opciones adicionales
 * @param {number} options.surgeMultiplier - Multiplicador de demanda (default: 1)
 * @param {number} options.tip - Propina opcional (default: 0)
 * @returns {Object} Objeto con el precio total y desglose
 * @example
 * const price = calculateTripPrice(5.2, 50, { surgeMultiplier: 1.5, tip: 20 });
 * console.log(price.total); // 410
 */
const calculateTripPrice = (distance, baseRate, options = {}) => {
  const { surgeMultiplier = 1, tip = 0 } = options;
  const basePrice = distance * baseRate * surgeMultiplier;
  const total = basePrice + tip;

  return {
    basePrice,
    surgeMultiplier,
    tip,
    total,
  };
};
```

### README Files

````markdown
# UserService

Servicio para gestión de usuarios que proporciona operaciones CRUD y validaciones.

## Uso

```javascript
import { UserService } from "./UserService";

const userService = new UserService();

// Crear usuario
const newUser = await userService.createUser({
  name: "Juan",
  email: "juan@example.com",
});

// Obtener usuario
const user = await userService.getUserById("123");
```
````

## Métodos

### createUser(userData)

Crea un nuevo usuario en el sistema.

**Parámetros:**

- `userData` (Object): Datos del usuario
  - `name` (string): Nombre del usuario
  - `email` (string): Email del usuario
  - `password` (string): Contraseña del usuario

**Retorna:**

- `Promise<Object>`: Usuario creado

**Lanza:**

- `ValidationError`: Si los datos no son válidos
- `DuplicateError`: Si el email ya existe

## Ejemplos

Ver [ejemplos](./examples/) para casos de uso comunes.

````

## ⚡ Performance

### React Performance

```jsx
// ✅ Correcto - Memoización
const TripItem = memo(({ trip, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(trip.id);
  }, [trip.id, onPress]);

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text>{trip.origin} → {trip.destination}</Text>
    </TouchableOpacity>
  );
});

// ✅ Correcto - useMemo para cálculos costosos
const TripList = ({ trips, filters }) => {
  const filteredTrips = useMemo(() => {
    return trips.filter(trip =>
      trip.status === filters.status &&
      trip.date >= filters.dateFrom
    );
  }, [trips, filters]);

  return (
    <FlatList
      data={filteredTrips}
      renderItem={({ item }) => <TripItem trip={item} />}
      keyExtractor={item => item.id}
    />
  );
};
````

### API Performance

```javascript
// ✅ Correcto - Paginación
const getTrips = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  return await Trip.find().skip(skip).limit(limit).sort({ createdAt: -1 });
};

// ✅ Correcto - Caching
const getCachedUser = async (userId) => {
  const cacheKey = `user:${userId}`;

  // Intentar obtener del cache
  let user = await redis.get(cacheKey);

  if (!user) {
    // Si no está en cache, obtener de la BD
    user = await User.findById(userId);

    // Guardar en cache por 1 hora
    await redis.setex(cacheKey, 3600, JSON.stringify(user));
  } else {
    user = JSON.parse(user);
  }

  return user;
};
```

## 🔒 Seguridad

### Input Validation

```javascript
// ✅ Correcto - Validación estricta
const validateUserInput = (userData) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
      )
      .required(),
    phone: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .optional(),
  });

  const { error, value } = schema.validate(userData);

  if (error) {
    throw new ValidationError(error.details[0].message);
  }

  return value;
};
```

### Sanitization

```javascript
// ✅ Correcto - Sanitización de entrada
const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return input.trim().replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "'":
          return "&#39;";
        case '"':
          return "&quot;";
        case "&":
          return "&amp;";
        default:
          return char;
      }
    });
  }

  if (typeof input === "object" && input !== null) {
    const sanitized = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }

  return input;
};
```

### Secure Storage

```javascript
// ✅ Correcto - Almacenamiento seguro
const secureStorage = {
  async setItem(key, value) {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(value),
        SECRET_KEY
      ).toString();

      await AsyncStorage.setItem(key, encrypted);
      return true;
    } catch (error) {
      logger.error("Error setting secure item:", error);
      return false;
    }
  },

  async getItem(key) {
    try {
      const encrypted = await AsyncStorage.getItem(key);
      if (!encrypted) return null;

      const decryptedBytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      const decrypted = JSON.parse(decryptedBytes.toString(CryptoJS.enc.Utf8));

      return decrypted;
    } catch (error) {
      logger.error("Error getting secure item:", error);
      return null;
    }
  },
};
```

---

Siguiendo estos estándares, mantenemos un código consistente, legible y de alta calidad que facilita el mantenimiento y la colaboración en el proyecto GoTaxi. 🚕✨
