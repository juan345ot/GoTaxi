export default function useAnalytics() {
  const logEvent = (event, params) => {
    // integración con analytics real
    console.log('Evento:', event, params);
  };
  return { logEvent };
}
