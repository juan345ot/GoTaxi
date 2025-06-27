// Simulación de solicitud de viaje
export const requestRide = async ({ origin, destination, user }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (origin && destination && user) {
        resolve({
          success: true,
          rideId: Math.floor(Math.random() * 10000),
          status: 'pending',
          driverAssigned: false,
        });
      } else {
        reject('Faltan datos para solicitar el viaje.');
      }
    }, 1000);
  });
};

// Simulación de seguimiento de viaje
export const trackRide = async (rideId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'en camino',
        driver: {
          name: 'Juan Pérez',
          car: 'Toyota Etios - AB123CD',
        },
        location: {
          latitude: -34.6037,
          longitude: -58.3816,
        },
      });
    }, 1000);
  });
};
