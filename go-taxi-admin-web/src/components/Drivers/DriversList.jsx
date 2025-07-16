import { useEffect, useState } from 'react';
import { getDrivers } from '../../api/driversApi';
import DriverApproval from './DriverApproval';

export default function DriversList() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    getDrivers().then(({ data }) => setDrivers(data));
  }, []);

  return (
    <div>
      {drivers.map(driver => (
        <DriverApproval key={driver.id} driver={driver} />
      ))}
    </div>
  );
}
