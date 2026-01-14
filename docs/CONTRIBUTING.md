# 🤝 Guía de Contribución - GoTaxi

¡Gracias por tu interés en contribuir a GoTaxi! Esta guía te ayudará a entender cómo puedes participar en el desarrollo del proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#-código-de-conducta)
- [Cómo Contribuir](#-cómo-contribuir)
- [Configuración del Entorno](#-configuración-del-entorno)
- [Estándares de Código](#-estándares-de-código)
- [Proceso de Pull Request](#-proceso-de-pull-request)
- [Reportar Bugs](#-reportar-bugs)
- [Solicitar Features](#-solicitar-features)
- [Preguntas Frecuentes](#-preguntas-frecuentes)

## 📜 Código de Conducta

### Nuestros Compromisos

Nos comprometemos a hacer de la participación en nuestro proyecto una experiencia libre de acoso para todos, independientemente de:

- Edad, tamaño corporal, discapacidad visible o invisible
- Etnia, características sexuales, identidad y expresión de género
- Nivel de experiencia, educación, estatus socioeconómico
- Nacionalidad, apariencia personal, raza, religión
- Identidad sexual y orientación sexual

### Comportamientos Esperados

- Usar lenguaje acogedor e inclusivo
- Respetar diferentes puntos de vista y experiencias
- Aceptar críticas constructivas con gracia
- Enfocarse en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros de la comunidad

### Comportamientos Inaceptables

- Uso de lenguaje o imágenes sexualizadas
- Comentarios despectivos, insultos o ataques personales
- Acoso público o privado
- Publicar información privada sin permiso
- Cualquier conducta inapropiada en un contexto profesional

## 🚀 Cómo Contribuir

### 1. Fork del Proyecto

1. Ve a [GoTaxi en GitHub](https://github.com/tu-usuario/gotaxi)
2. Haz clic en "Fork" en la esquina superior derecha
3. Clona tu fork localmente:

```bash
git clone https://github.com/tu-usuario/gotaxi.git
cd gotaxi
```

### 2. Configurar el Remote

```bash
git remote add upstream https://github.com/original-usuario/gotaxi.git
```

### 3. Crear una Rama

```bash
git checkout -b feature/nueva-funcionalidad
# o
git checkout -b fix/correccion-bug
```

### 4. Hacer Cambios

- Realiza tus cambios siguiendo los estándares de código
- Escribe tests para tu código
- Actualiza la documentación si es necesario
- Asegúrate de que todos los tests pasen

### 5. Commit y Push

```bash
git add .
git commit -m "feat: agregar nueva funcionalidad de notificaciones"
git push origin feature/nueva-funcionalidad
```

### 6. Crear Pull Request

1. Ve a tu fork en GitHub
2. Haz clic en "New Pull Request"
3. Completa la plantilla de PR
4. Asigna revisores si es necesario

## ⚙️ Configuración del Entorno

### Prerrequisitos

- Node.js 18+
- MongoDB 5+
- Git
- npm o yarn
- Expo CLI (para desarrollo móvil)

### Backend

```bash
cd go-taxi-backend
npm install
cp .env.example .env
# Configurar variables de entorno
npm run dev
```

### Frontend Mobile

```bash
cd GoTaxiPassengerApp
npm install
cp .env.example .env
# Configurar variables de entorno
npm start
```

### Panel Admin

```bash
cd go-taxi-admin-web
npm install
cp .env.example .env
# Configurar variables de entorno
npm run dev
```

### Testing

```bash
# Backend
cd go-taxi-backend
npm test

# Frontend Mobile
cd GoTaxiPassengerApp
npm test

# Panel Admin
cd go-taxi-admin-web
npm test
```

## 📏 Estándares de Código

### JavaScript/TypeScript

#### Naming Conventions

```javascript
// ✅ Correcto
const userName = "juan";
const isUserActive = true;
const MAX_RETRY_ATTEMPTS = 3;

// ❌ Incorrecto
const username = "juan";
const is_user_active = true;
const maxretryattempts = 3;
```

#### Function Declarations

```javascript
// ✅ Correcto
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ❌ Incorrecto
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

#### Error Handling

```javascript
// ✅ Correcto
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  logger.error("Error in riskyOperation:", error);
  return { success: false, error: error.message };
}

// ❌ Incorrecto
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.log(error);
  throw error;
}
```

### React/React Native

#### Component Structure

```jsx
// ✅ Correcto
import React, { useState, useEffect, memo } from "react";
import { View, Text, StyleSheet } from "react-native";

const UserProfile = memo(({ userId, onUpdate }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <LoadingSpinner />;

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

#### Hooks

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
        const userData = await userApi.getUser(userId);
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  return { user, loading, error };
};
```

### CSS/Styling

#### Tailwind CSS

```jsx
// ✅ Correcto
<div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-800 mb-2">Título</h2>
  <p className="text-gray-600 text-center">Descripción</p>
</div>

// ❌ Incorrecto
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Título</h2>
</div>
```

#### React Native Styles

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
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});
```

### Git

#### Commit Messages

```bash
# ✅ Correcto
feat: agregar sistema de notificaciones push
fix: corregir error de validación en formulario de registro
docs: actualizar documentación de API
style: aplicar formato de código con Prettier
refactor: extraer lógica de validación a utilidad separada
test: agregar tests para servicio de autenticación
chore: actualizar dependencias de desarrollo

# ❌ Incorrecto
agregar notificaciones
fix
actualizar docs
cambios
```

#### Branch Naming

```bash
# ✅ Correcto
feature/user-authentication
feature/payment-integration
fix/login-validation-error
fix/memory-leak-in-map-component
docs/api-documentation
chore/update-dependencies

# ❌ Incorrecto
new-feature
fix
update
changes
```

## 🔄 Proceso de Pull Request

### 1. Antes de Crear el PR

- [ ] Código sigue los estándares del proyecto
- [ ] Tests pasan localmente
- [ ] Documentación actualizada si es necesario
- [ ] No hay conflictos con la rama principal
- [ ] Commit messages siguen el formato correcto

### 2. Plantilla de PR

```markdown
## Descripción

Breve descripción de los cambios realizados.

## Tipo de Cambio

- [ ] Bug fix (cambio que corrige un problema)
- [ ] New feature (cambio que agrega funcionalidad)
- [ ] Breaking change (cambio que rompe compatibilidad)
- [ ] Documentation update (actualización de documentación)

## Cómo Probar

1. Pasos para probar los cambios
2. Datos de prueba si es necesario
3. Resultado esperado

## Screenshots (si aplica)

Agregar capturas de pantalla para cambios de UI.

## Checklist

- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado mi código donde sea necesario
- [ ] Mis cambios no generan warnings
- [ ] He agregado tests que prueban mi fix/feature
- [ ] Los tests nuevos y existentes pasan localmente
- [ ] Cualquier cambio dependiente ha sido mergeado y publicado
```

### 3. Revisión de Código

#### Para Revisores

- [ ] Código es legible y bien estructurado
- [ ] Lógica es correcta y eficiente
- [ ] Tests son apropiados y cubren el código
- [ ] No hay código duplicado
- [ ] Manejo de errores es apropiado
- [ ] Performance es aceptable
- [ ] Seguridad no está comprometida

#### Para Autores

- [ ] Responder a todos los comentarios
- [ ] Hacer cambios solicitados
- [ ] Explicar decisiones de diseño si es necesario
- [ ] Actualizar PR si hay nuevos commits

## 🐛 Reportar Bugs

### Usar el Template de Issue

```markdown
## Descripción del Bug

Descripción clara y concisa del problema.

## Pasos para Reproducir

1. Ir a '...'
2. Hacer clic en '...'
3. Scroll hasta '...'
4. Ver error

## Comportamiento Esperado

Descripción de lo que debería pasar.

## Screenshots

Si aplica, agregar capturas de pantalla.

## Información del Sistema

- OS: [e.g. iOS, Android, Windows, macOS]
- Browser: [e.g. Chrome, Safari, Firefox]
- Version: [e.g. 1.0.0]

## Información Adicional

Cualquier otra información relevante.
```

### Severidad de Bugs

- **Critical**: Aplicación no funciona o datos se pierden
- **High**: Funcionalidad principal no funciona
- **Medium**: Funcionalidad secundaria no funciona
- **Low**: Problemas menores o mejoras

## 💡 Solicitar Features

### Usar el Template de Feature Request

```markdown
## Descripción de la Feature

Descripción clara y concisa de la funcionalidad deseada.

## Problema que Resuelve

¿Qué problema resuelve esta feature?

## Solución Propuesta

Descripción de la solución que te gustaría ver.

## Alternativas Consideradas

Otras soluciones que consideraste.

## Información Adicional

Cualquier otra información relevante.
```

### Priorización

- **P0**: Crítico para el negocio
- **P1**: Importante para usuarios
- **P2**: Mejora de experiencia
- **P3**: Nice to have

## ❓ Preguntas Frecuentes

### ¿Cómo empiezo a contribuir?

1. Lee la documentación del proyecto
2. Configura tu entorno de desarrollo
3. Busca issues marcados como "good first issue"
4. Pregunta en Discord si tienes dudas

### ¿Qué hago si no sé por dónde empezar?

- Revisa los issues abiertos
- Busca bugs o mejoras pequeñas
- Pregunta en Discord por orientación
- Revisa el código existente para entender la estructura

### ¿Cómo puedo obtener ayuda?

- **Discord**: [Servidor de GoTaxi](https://discord.gg/gotaxi)
- **GitHub Discussions**: Para preguntas generales
- **Issues**: Para bugs y features
- **Email**: dev@gotaxi.com

### ¿Cuánto tiempo tengo para completar un issue?

- **Bugs críticos**: 24-48 horas
- **Features pequeñas**: 1-2 semanas
- **Features grandes**: 2-4 semanas
- **Documentación**: 1 semana

### ¿Qué pasa si no puedo completar un issue?

- Comunícalo lo antes posible
- Explica qué parte completaste
- Ofrece transferir el trabajo a otro contribuidor
- No hay problema, es parte del proceso

### ¿Cómo se decide qué features implementar?

- **Impacto en usuarios**: ¿Cuántos usuarios se benefician?
- **Complejidad**: ¿Qué tan difícil es implementar?
- **Alineación con objetivos**: ¿Va con la visión del producto?
- **Recursos disponibles**: ¿Tenemos tiempo y personas?

## 🎉 Reconocimientos

### Contribuidores Destacados

- **@usuario1** - Implementó sistema de pagos
- **@usuario2** - Mejoró performance del frontend
- **@usuario3** - Agregó tests comprehensivos

### Cómo Reconocer Contribuciones

- **Hacktoberfest**: Participación en eventos
- **Contributor Badges**: Insignias en GitHub
- **Mention en README**: Reconocimiento público
- **Swag**: Merchandise para contribuidores activos

## 📞 Contacto

- **Email**: dev@gotaxi.com
- **Discord**: [Servidor de GoTaxi](https://discord.gg/gotaxi)
- **Twitter**: [@GoTaxiApp](https://twitter.com/GoTaxiApp)
- **LinkedIn**: [GoTaxi Company](https://linkedin.com/company/gotaxi)

---

¡Gracias por contribuir a GoTaxi! Tu participación hace que el proyecto sea mejor para todos. 🚕✨
