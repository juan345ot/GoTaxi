import { useState } from 'react';
export default function useTrips() {
  const [trips, setTrips] = useState([]);
  const addTrip = trip => setTrips([...trips, trip]);
  return { trips, setTrips, addTrip };
}
