export const mockTrips = [
  { id: 1, origen: "Plaza", destino: "Hospital", monto: 1200 }
];
export const mockDrivers = [
  { id: 1, nombre: "Juan", apellido: "Pérez", telefono: "1234567890" },
  { id: 2, nombre: "Ana", apellido: "Gómez", telefono: "0987654321" }
];    

export const mockVehicles = [
  { id: 1, marca: "Toyota", modelo: "Corolla", placa: "ABC123" },
  { id: 2, marca: "Honda", modelo: "Civic", placa: "XYZ456" }            
];  

export const mockLocations = [
  { id: 1, nombre: "Plaza", latitud: -34.6037, longitud: -58.3816 },
  { id: 2, nombre: "Hospital", latitud: -34.61037, longitud: -58.3816 }
];

export const mockUsers = [
  { id: 1, nombre: "Carlos", apellido: "López", email: "conductor@gotaxi.com", telefono: "1234567890", foto: "https://example.com/foto1.jpg" },
  { id: 2, nombre: "Romina", apellido: "López", email: "pasajero@gotaxi.com", telefono: "0987654321", foto: "https://example.com/foto2.jpg" }
];

export const mockPayments = [
  { id: 1, tipo: "Efectivo", monto: 1200, fecha: "2023-10-01" },
  { id: 2, tipo: "Tarjeta", monto: 1500, fecha: "2023-10-02" }
];

export const mockRatings = [
  { id: 1, usuarioId: 1, conductorId: 2, puntuacion: 5, comentario: "Excelente servicio" },
  { id: 2, usuarioId: 2, conductorId: 1, puntuacion: 4, comentario: "Muy buen viaje" }
];  
export const mockNotifications = [
  { id: 1, usuarioId: 1, mensaje: "Tu viaje ha sido confirmado", fecha: "2023-10-01" },
  { id: 2, usuarioId: 2, mensaje: "Tu conductor está en camino", fecha: "2023-10-02" }
];

export const mockSupportTickets = [
  { id: 1, usuarioId: 1, asunto: "Problema con el viaje", descripcion: "El viaje no se inició correctamente", estado: "Abierto", fechaCreacion: "2023-10-01" },
  { id: 2, usuarioId: 2, asunto: "Consulta sobre tarifas", descripcion: "¿Cuáles son las tarifas para viajes largos?", estado: "Cerrado", fechaCreacion: "2023-10-02" }
];
export const mockPromotions = [
  { id: 1, codigo: "DESCUENTO10", descripcion: "10% de descuento en tu primer viaje", fechaInicio: "2023-10-01", fechaFin: "2023-10-31" },
  { id: 2, codigo: "FREERIDE", descripcion: "Viaje gratis en tu próximo viaje", fechaInicio: "2023-10-05", fechaFin: "2023-10-15" }
];
export const mockRideHistory = [
  { id: 1, usuarioId: 1, conductorId: 2, fecha: "2023-10-01", origen: "Plaza", destino: "Hospital", monto: 1200 },
  { id: 2, usuarioId: 2, conductorId: 1, fecha: "2023-10-02", origen: "Hospital", destino: "Plaza", monto: 1500 }
];
export const mockVehicleTypes = [
  { id: 1, tipo: "Sedán", capacidad: 4 },
  { id: 2, tipo: "SUV", capacidad: 6 }
];
export const mockTripRequests = [
  { id: 1, usuarioId: 1, origen: "Plaza", destino: "Hospital", estado: "Pendiente", fechaSolicitud: "2023-10-01" },
  { id: 2, usuarioId: 2, origen: "Hospital", destino: "Plaza", estado: "Aceptado", fechaSolicitud: "2023-10-02" }
];
export const mockDriverLocations = [
  { id: 1, conductorId: 1, latitud: -34.6037, longitud: -58.3816, fechaActualizacion: "2023-10-01" },
  { id: 2, conductorId: 2, latitud: -34.61037, longitud: -58.3816, fechaActualizacion: "2023-10-02" }
];
export const mockDriverStats = [
  { id: 1, conductorId: 1, viajesCompletados: 10, calificacionPromedio: 4.8 },
  { id: 2, conductorId: 2, viajesCompletados: 15, calificacionPromedio: 4.5 }
];
export const mockVehicleMaintenance = [
  { id: 1, vehiculoId: 1, fechaMantenimiento: "2023-10-01", descripcion: "Cambio de aceite", costo: 500 },
  { id: 2, vehiculoId: 2, fechaMantenimiento: "2023-10-02", descripcion: "Revisión de frenos", costo: 300 }
];
export const mockDriverAvailability = [
  { id: 1, conductorId: 1, disponible: true, fechaActualizacion: "2023-10-01" },
  { id: 2, conductorId: 2, disponible: false, fechaActualizacion: "2023-10-02" }
];
export const mockDriverEarnings = [
  { id: 1, conductorId: 1, totalGanancias: 5000, fecha: "2023-10-01" },
  { id: 2, conductorId: 2, totalGanancias: 7000, fecha: "2023-10-02" }
];
export const mockDriverReviews = [
  { id: 1, conductorId: 1, usuarioId: 2, comentario: "Muy buen conductor", puntuacion: 5, fecha: "2023-10-01" },
  { id: 2, conductorId: 2, usuarioId: 1, comentario: "Conductor amable", puntuacion: 4, fecha: "2023-10-02" }
];
export const mockDriverDocuments = [
  { id: 1, conductorId: 1, tipo: "Licencia de conducir", estado: "Válido", fechaExpedicion: "2023-01-01", fechaExpiracion: "2025-01-01" },
  { id: 2, conductorId: 2, tipo: "Certificado de antecedentes", estado: "Válido", fechaExpedicion: "2023-02-01", fechaExpiracion: "2025-02-01" }
];
export const mockDriverSchedules = [
  { id: 1, conductorId: 1, dia: "Lunes", horaInicio: "08:00", horaFin: "18:00" },
  { id: 2, conductorId: 2, dia: "Martes", horaInicio: "09:00", horaFin: "19:00" }
];
export const mockDriverFeedback = [
  { id: 1, conductorId: 1, usuarioId: 2, feedback: "Excelente servicio", fecha: "2023-10-01" },
  { id: 2, conductorId: 2, usuarioId: 1, feedback: "Muy profesional", fecha: "2023-10-02" }
];
export const mockDriverTraining = [
  { id: 1, conductorId: 1, curso: "Atención al cliente", fechaCompletado: "2023-01-15" },
  { id: 2, conductorId: 2, curso: "Seguridad vial", fechaCompletado: "2023-02-20" }
];
export const mockDriverInsurance = [
  { id: 1, conductorId: 1, tipo: "Seguro de responsabilidad civil", estado: "Activo", fechaInicio: "2023-01-01", fechaFin: "2024-01-01" },
  { id: 2, conductorId: 2, tipo: "Seguro de accidentes personales", estado: "Activo", fechaInicio: "2023-02-01", fechaFin: "2024-02-01" }
];