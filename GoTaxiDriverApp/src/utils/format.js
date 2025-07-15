export const formatMoney = num => `$${Number(num).toLocaleString('es-AR')}`;
export const formatDate = date =>
  new Date(date).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
export const formatDateOnly = date =>
  new Date(date).toLocaleDateString('es-AR', { dateStyle: 'short' });
export const formatTime = date =>
  new Date(date).toLocaleTimeString('es-AR', { timeStyle: 'short' });
export const formatDistance = (distance, unit = 'km') => {
  const formattedDistance = Number(distance).toLocaleString('es-AR', {
    maximumFractionDigits: 2,
  });
  return `${formattedDistance} ${unit}`;
};
export const formatDuration = (duration, unit = 'min') => {
  const formattedDuration = Number(duration).toLocaleString('es-AR', {
    maximumFractionDigits: 0,
  });
  return `${formattedDuration} ${unit}`;
};
export const formatRating = rating => { 
  const formattedRating = Number(rating).toFixed(1);
  return `${formattedRating} ★`;
}
export const formatPhoneNumber = phone => {
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return null;
}
export const formatAddress = address => {
  if (!address) return '';
  const { street, city, state, zip } = address;
  return `${street}, ${city}, ${state} ${zip}`;
}
export const formatCoordinates = (lat, lng) => {
  return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
}
export const formatVehicleInfo = (vehicle) => {
  if (!vehicle) return '';
  const { make, model, year, plate } = vehicle;
  return `${year} ${make} ${model} (${plate})`;
}
export const formatTripStatus = status => {
  const statuses = {
    'pending': 'Pendiente',
    'accepted': 'Aceptado',
    'in_progress': 'En Progreso',
    'completed': 'Completado',
    'cancelled': 'Cancelado'
  };
  return statuses[status] || status;
}

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}   

export const formatPercentage = (value) => {
  const formattedValue = Number(value).toLocaleString('es-AR', {
    maximumFractionDigits: 2,
  });
  return `${formattedValue}%`;
}
export const formatTimeAgo = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} día${days > 1 ? 's' : ''} atrás`;
  if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
  if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
  return `${seconds} segundo${seconds > 1 ? 's' : ''} atrás`;
}

export const formatDistanceToString = (distance) => {
  if (distance < 1000) {
    return `${distance} m`;
  } else {
    const km = (distance / 1000).toFixed(2);
    return `${km} km`;
  }
}

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export const formatDateTimeWithSeconds = (date) => {
  return new Date(date).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  });
}   

export const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  else if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
  else if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(2)} MB`;
  else return `${(bytes / 1073741824).toFixed(2)} GB`;
}

export const formatJson = (json) => {
  try {
    return JSON.stringify(json, null, 2);
  } catch (_) {
    return 'Invalid JSON';
  }
}

export const formatUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    return `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
  } catch (_) {
    return 'Invalid URL';
  }
}

export const formatTimeDuration = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hrs > 0 ? `${hrs}h ` : ''}${mins > 0 ? `${mins}m ` : ''}${secs}s`;
}   
export const formatFileName = (filePath) => {
  const parts = filePath.split('/');
  return parts[parts.length - 1];
}   
export const formatFileExtension = (filePath) => {
  const parts = filePath.split('.');
  return parts.length > 1 ? parts.pop() : '';
}
export const formatTimeSince = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} día${days > 1 ? 's' : ''} desde`;
  if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} desde`;
  if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''} desde`;
  return `${seconds} segundo${seconds > 1 ? 's' : ''} desde`;
}
export const formatFilePath = (filePath) => {
  const parts = filePath.split('/');
  return parts.length > 1 ? parts.join('/') : filePath;
}
export const formatTimeTo12Hour = (date) => {
  return new Date(date).toLocaleString('es-AR', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
}
export const formatTimeTo24Hour = (date) => {
  return new Date(date).toLocaleString('es-AR', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
}
export const formatTimeWithSeconds = (date) => {
  return new Date(date).toLocaleTimeString('es-AR', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  });
}
export const formatTimeWithMilliseconds = (date) => {
  return new Date(date).toLocaleTimeString('es-AR', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    fractionalSecondDigits: 3,
  });
}
export const formatTimeZone = (date) => {
  return new Date(date).toLocaleTimeString('es-AR', {
    timeZoneName: 'short',
  });
}
