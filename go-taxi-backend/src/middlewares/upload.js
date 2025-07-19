const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const nombreArchivo = file.fieldname + '-' + Date.now() + ext;
    cb(null, nombreArchivo);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Tipo de archivo no permitido'), false);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
