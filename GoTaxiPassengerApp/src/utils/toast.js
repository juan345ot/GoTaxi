import { Platform, ToastAndroid, Alert } from 'react-native';

function showAndroid(msg, long = false) {
  ToastAndroid.show(String(msg || ''), long ? ToastAndroid.LONG : ToastAndroid.SHORT);
}
function showGeneric(title, msg) {
  Alert.alert(title, String(msg || ''));
}

export const toast = {
  success(message = 'Operación exitosa') {
    if (Platform.OS === 'android') return showAndroid(message, false);
    return showGeneric('Éxito', message);
  },
  error(message = 'Ocurrió un error') {
    if (Platform.OS === 'android') return showAndroid(message, true);
    return showGeneric('Error', message);
  },
  info(message = 'Información') {
    if (Platform.OS === 'android') return showAndroid(message, false);
    return showGeneric('Info', message);
  },
};

/**
 * Compatibilidad con código viejo:
 * showToast('mensaje', 'success'|'error'|'info')
 * Si no pasás tipo, usa 'info'.
 */
export function showToast(message, type = 'info') {
  const fn = toast[type] || toast.info;
  fn(message);
}

// export default opcional por si en algún lado hacen `import toast from ...`
export default toast;