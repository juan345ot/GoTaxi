export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return `${date.toLocaleDateString()} - ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};