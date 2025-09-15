/**
 * Enumeraciones y constantes del backend GoTaxi.
 *
 * Definirlas como constantes e inmutables (Object.freeze) evita
 * modificaciones accidentales durante la ejecución.
 */

// Estados posibles de un viaje
const TRIP_STATUS = Object.freeze({
  PENDIENTE: 'pendiente',
  ASIGNADO: 'asignado',
  EN_CURSO: 'en_curso',
  FINALIZADO: 'finalizado',
  CANCELADO: 'cancelado',
});

// Métodos de pago aceptados
const PAYMENT_METHOD = Object.freeze({
  EFECTIVO: 'efectivo',
  TARJETA: 'tarjeta',
  MP: 'mercadopago',
});

// Estados de un pago
const PAYMENT_STATUS = Object.freeze({
  PENDIENTE: 'pendiente',
  PAGADO: 'pagado',
  FALLIDO: 'fallido',
});

// Tipos de configuración
const CONFIG_TYPE = Object.freeze({
  TARIFA: 'tarifa',
  COMISION: 'comision',
});

module.exports = Object.freeze({
  TRIP_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  CONFIG_TYPE,
});
