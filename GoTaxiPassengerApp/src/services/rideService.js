export const requestRide = async (origin, destination) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (origin && destination) {
        resolve({
          id: Date.now(),
          origin,
          destination,
          driver: 'Juan M.',
          vehicle: 'Toyota Etios Blanco',
          status: 'camino',
        });
      } else {
        reject('Faltan datos del viaje');
      }
    }, 1000);
  });
};

export const trackRide = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        driverPosition: {
          latitude: -34.602,
          longitude: -58.384,
        },
        status: 'camino',
      });
    }, 500);
  });
};

export const cancelRide = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ message: 'Viaje cancelado correctamente' });
    }, 500);
  });
};