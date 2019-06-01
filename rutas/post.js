"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const autenticacion_1 = require("../middlewares/autenticacion");
const post_models_1 = require("../models/post.models");
const file_system_1 = __importDefault(require("../classes/file-system"));
// estas ruta esta definida en el index.ts
const postRoutes = express_1.Router();
// creamos una instancia de la clase FileSystem
const fileSystem = new file_system_1.default();
/////////////////////// rutas de post /////////////////////////
//////////////////////////////////////
/// ruta  de crear un post : crear un post es almacenar en mongo un post con las rutas a sus imagenes
// ya previamente salvadas en temp y luego copiadas en la carpeta post. todo esto en el uplod de dist/
// postman : localhost:5000/posts/create
// en el body ponemos : 
// mensaje  y coords ... lo demas esta en el token 
// las imagenes estan previamente cargadas en la carpeta temp 
postRoutes.post('/create', [autenticacion_1.verificaToken], (req, res) => {
    console.log('entramos en posts create');
    // en el body voy a tener parte de las mismas propiedades que en el modelo 
    /*
    nmbre>
    : string
    created: Date;
    comentario: string;
    img: string[];
    coords: string;
    usuario: string;  // quien crea el post
    */
    const body = req.body;
    // req.usuario._id es lo viene por ejecutar el verificatoken 
    // que devuelve en el req la info del usuario
    // lo colocamos en el body ( ya que el cliente no lo pone)
    body.usuario = req.usuario._id;
    // creo un arreglo de imagenes que seran parte del  arreglo las que quedaran en mongo
    const imagenes = fileSystem.imagenesDeTempHaciaPost(req.usuario._id);
    console.log('usuario id ', req.usuario._id);
    console.log('ruta create post estas son las imagenes que pasamos de temp a post ', imagenes);
    body.imgs = imagenes;
    post_models_1.Post.create(body).then((postDB) => __awaiter(this, void 0, void 0, function* () {
        // en postDB esta el id del usuario , si quiero que me de toda la info del usuario
        // hago un populate , como populate es una promesa paso a postDB por un async await 
        // para que el .json espere a que se ejecute esa promesa 
        const noTraer = '-passwordTemporal -emailEncriptado -cuentaVerificada';
        yield postDB.populate('usuario', noTraer).execPopulate();
        res.status(202).json({
            ok: true,
            post: postDB
        });
    }))
        .catch(err => {
        res.status(400).json(err);
    });
});
//////////////////////////////////////
/// ruta  de obtener posts paginados 
// postman : localhost:5000/posts/getPosts
// el find es una promesa , hay que esperar que la ejecute antes de ejecutar el .json de respuesta 
// lo hacemos con al aync await 
// ponemos una propiedad de pagina 
// postman : localhost:5000/posts/getPosts?pagina=2
postRoutes.get('/getPosts', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    console.log('entramos en posts getposts');
    //  el query es lo que viene en la url como parametro opcional 
    // si no viene la pag colocamos la 1 
    let pagina = Number(req.query.pagina) || 1;
    const noTraer = '-passwordTemporal -emailEncriptado -cuentaVerificada';
    // skip = 0 no me salteo ninguna pagina 
    // skip = 1 ( pagina = 2) , me salteo las 10 primeras
    let skip = pagina - 1;
    skip = skip * 5;
    const posts = yield post_models_1.Post.find()
        .sort({ _id: -1 }) // lo quiero en forma descendente
        .skip(skip)
        .limit(5) // los ultimos 10 o siguientes 10 
        .populate('usuario', noTraer)
        .exec();
    res.status(200).json({
        ok: true,
        pagina,
        posts
    });
}));
//////////////////////////////////////
/// ruta  de obtener una imagen mediante el id del usuario 
// postman : localhost:5000/posts/imagen/userid/img
postRoutes.get('/imagen/:userid/:img', (req, res) => {
    console.log('entramos en posts imagen userid img');
    //  el params es lo que viene en la url como parametro para rescatarlo de la url
    const userId = req.params.userid;
    const img = req.params.img;
    // apuntamos a la imagen 
    const pathFoto = fileSystem.getFotoUrl(userId, img);
    console.log('el path foto es : ', pathFoto);
    res.type('jpg').status(201).sendFile(pathFoto, function (err) {
        if (err) {
            console.log('error');
        }
        else {
            console.log('Sent:');
        }
    });
});
//////////////////////////////////////
/// ruta  de obtener una imagen mediante el id del usuario 
// postman : localhost:5000/posts/getMyPosts/userid
postRoutes.get('/getMyPosts/:userid', (req, res) => __awaiter(this, void 0, void 0, function* () {
    console.log('entramos en posts getmyposts userid ');
    //  el params es lo que viene en la url como parametro para rescatarlo de la url
    const userId = req.params.userid;
    //console.log(userId);
    //  el query es lo que viene en la url como parametro opcional 
    // si no viene la pag colocamos la 1 
    let pagina = Number(req.query.pagina) || 1;
    const noTraer = '-passwordTemporal -emailEncriptado -cuentaVerificada';
    // skip = 0 no me salteo ninguna pagina 
    // skip = 1 ( pagina = 2) , me salteo las 10 primeras
    let skip = pagina - 1;
    skip = skip * 5;
    const posts = yield post_models_1.Post.find({ 'usuario': userId })
        .sort({ _id: -1 }) // lo quiero en forma descendente
        .skip(skip)
        .limit(5) // los ultimos 10 o siguientes 10 
        .populate('usuario', noTraer)
        .exec();
    res.status(200).json({
        ok: true,
        pagina,
        posts
    });
}));
// servicios para subir archivos , se pueden subir archivos de todo tipo , pero lo limitamos a imagenes 
//////////////////////////////////////
/// ruta  para subir archivos 
// postman : localhost:5000/posts/upload
// en el body del postman seleccionamos form-data , propiedad image de tipo file 
// el metodo guardarImagentemporal es un apromesa , por ende colocamos async await
postRoutes.post('/upload', [autenticacion_1.verificaToken], (req, res) => __awaiter(this, void 0, void 0, function* () {
    console.log('entramos en posts upload');
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'no se subio ningun archivo'
        });
    }
    ;
    // image  es la propiedad que viene del cliente que tiene el archivo 
    const file = req.files.image;
    if (!file) {
        return res.status(400).json({
            ok: false,
            mensaje: 'no se subio ningun archivo - image'
        });
    }
    ;
    if (!file.mimetype.includes('image')) {
        return res.status(400).json({
            ok: false,
            mensaje: 'no es una imagen'
        });
    }
    ;
    //guardamos la imagen en una carpeta temporal del usuario 
    yield fileSystem.guardarImagenTemporal(file, req.usuario._id);
    res.status(200).json({
        ok: true,
        estado: 'imagen guardada en carpeta temporal',
        file: file.mimetype
    });
}));
postRoutes.post('/prueba', (req, res) => {
    console.log('entramos en posts prueba');
    res.status(200).json({
        ok: true,
        estado: 'prueba'
    });
});
exports.default = postRoutes;
