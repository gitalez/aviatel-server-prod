"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uniqid_1 = __importDefault(require("uniqid"));
class FileSystem {
    constructor() { }
    ;
    // necesito que este metodo sea una promesa , la implemento 
    guardarImagenTemporal(file, userId) {
        return new Promise((resolve, reject) => {
            // primero creamos dos carpetas si no existen que perteneceran al usuario logueado
            const path = this.crearCarpetaUsuario(userId);
            // creamos un unico nombre del archivo 
            const nombreArchivo = this.generarNombreArchivo(file.name);
            console.log(nombreArchivo);
            // mover el archivo del file temp a la carpeta temporal
            // mv no trabaja con promesas , si con callback 
            file.mv(`${path}/${nombreArchivo}`, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    // todo bien 
                    resolve();
                }
            });
        });
    }
    generarNombreArchivo(nombreOriginal) {
        //el split separa en string que viene : 'paja.jpg' en dos y lo pone en un array asi : 
        // [ 'paja', 'jpg' ]
        const nombreArr = nombreOriginal.split('.');
        const extension = nombreArr[nombreArr.length - 1]; // devuelve el componente del array que tiene la extension 
        // generamos un id unico 
        const idUnico = uniqid_1.default();
        return `${idUnico}.${extension}`;
    }
    // creo la carpeta del usuario que quiere guardar imagenes  y dentro de ese folder , el folder temp
    crearCarpetaUsuario(userId) {
        // __dirname nos da el path completo hasta la carpeta del proyecto
        // lo importamos de path , propio de node 
        // creo un path  dentro de uploads con el id del usuario para crear la carpeta
        const pathUser = path_1.default.resolve(__dirname, '../uploads/', userId);
        // y otro con temp para crear la carpeta temp 
        const pathUserTemp = pathUser + '/temp';
        // verificamos si la carpeta existe 
        const existe = fs_1.default.existsSync(pathUser);
        if (!existe) {
            // creo dos carpetas en dist/ 
            fs_1.default.mkdirSync(pathUser);
            fs_1.default.mkdirSync(pathUserTemp);
        }
        ;
        return pathUserTemp;
    }
    // movemos las imagenes del folder a temp a post 
    imagenesDeTempHaciaPost(userId) {
        const pathTemp = path_1.default.resolve(__dirname, '../uploads', userId, 'temp');
        const pathPost = path_1.default.resolve(__dirname, '../uploads', userId, 'posts');
        console.log('temp', pathTemp);
        console.log('post', pathPost);
        if (!fs_1.default.existsSync(pathTemp)) {
            // no hay imagenes , porque no existe el pathTemp
            return [];
        }
        ;
        if (!fs_1.default.existsSync(pathPost)) {
            // no existe la carpeta posts , so la creo 
            fs_1.default.mkdirSync(pathPost);
        }
        ;
        // movemos  obteniendo las imagenes en Temp 
        const imagenesTemp = this.obtenerImagenesEnTemp(userId);
        // cambiando el path  , cambio el lugar donde quiero que este 
        imagenesTemp.forEach(imagen => {
            fs_1.default.renameSync(`${pathTemp}/${imagen}`, `${pathPost}/${imagen}`);
            //fs.unlinkSync(`${ pathTemp }/${ imagen }`);
        });
        return imagenesTemp; // tenemos la coleccion de imagenes 
    }
    // obtengo las imagenes en tempk para luego pasarlas a post
    obtenerImagenesEnTemp(userId) {
        const pathTemp = path_1.default.resolve(__dirname, '../uploads', userId, 'temp');
        // retorno un array vacio si no hay imagenes
        // lee todo el directorio que hay en el folder temp 
        return fs_1.default.readdirSync(pathTemp) || [];
    }
    getFotoUrl(userId, img) {
        // crear el path de los posts
        const pathFoto = path_1.default.resolve(__dirname, '../uploads', userId, 'posts', img);
        // la imagen existe 
        if (!fs_1.default.existsSync(pathFoto)) {
            // no hay imagenes 
            return path_1.default.resolve(__dirname, '../assets/400x25.jpg');
        }
        else {
            console.log('el path foto es : ', pathFoto);
            return pathFoto;
        }
    }
}
exports.default = FileSystem;
