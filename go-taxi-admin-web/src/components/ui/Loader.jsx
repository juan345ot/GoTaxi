export default function Loader({ size = 5, className = "" }) {
  // size en rem
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-blue-400 border-t-transparent align-middle ${className}`}
      style={{
        width: `${size * 0.25}rem`,
        height: `${size * 0.25}rem`,
      }}
      aria-label="Cargando"
    ></span>
  );
}
