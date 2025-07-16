import { approveDriver, rejectDriver } from '../../api/driversApi';

export default function DriverApproval({ driver }) {
  const handleApprove = () => approveDriver(driver.id, driver.rank <= 5);
  const handleReject = () => rejectDriver(driver.id);

  return (
    <div>
      <p>{driver.name}</p>
      <button onClick={handleApprove}>Aprobar</button>
      <button onClick={handleReject}>Rechazar</button>
    </div>
  );
}
