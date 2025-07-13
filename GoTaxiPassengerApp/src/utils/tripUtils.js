export const BASE_FARE = 500;
export const FARE_PER_100M = 60;

export function calcularImporte(distanciaMetros) {
  if (!distanciaMetros || isNaN(distanciaMetros)) return BASE_FARE;
  const tramos = Math.ceil(distanciaMetros / 100);
  return BASE_FARE + (FARE_PER_100M * tramos);
}

export function generarPin() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
