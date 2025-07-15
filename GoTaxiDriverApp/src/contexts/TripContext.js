import React, { createContext, useContext, useState } from 'react';

const TripContext = createContext();
export const useTrip = () => useContext(TripContext);

export function TripProvider({ children }) {
  const [activeTrip, setActiveTrip] = useState(null);
  return (
    <TripContext.Provider value={{ activeTrip, setActiveTrip }}>
      {children}
    </TripContext.Provider>
  );
}
