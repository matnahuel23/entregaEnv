const multer = require ('multer');

//Antes de instanciar multer, debemos configurar dónde se almacenarán los archivos.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/public/img'); // Ruta donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

module.exports = multer({storage: storage })
