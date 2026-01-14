const multer = require('multer');
const path = require('path');

/*
 * Configuración de subida de archivos mediante Multer.
 *
 * - Guarda los archivos en la carpeta /uploads relativa al proyecto.
 * - El nombre del archivo incluye el campo original y una marca temporal.
 * - Sólo se aceptan archivos de imagen. Al detectarse un tipo no permitido,
 *   se genera un error con código y status para que el errorHandler lo procese.
 * - Se puede configurar un tamaño máximo de archivo mediante la variable
 *   MAX_FILE_SIZE (por defecto 2 MB).
 */

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname);
    const nombreArchivo = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, nombreArchivo);
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  // Crear un error personalizado para tipos no permitidos
  const err = new Error('Tipo de archivo no permitido');
  err.status = 400;
  err.code = 'INVALID_FILE_TYPE';
  return cb(err, false);
};

const maxSize = parseInt(process.env.MAX_FILE_SIZE, 10) || 2 * 1024 * 1024; // 2MB

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
});

module.exports = upload;
