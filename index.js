"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = __importDefault(require("./classes/server"));
const environment_1 = require("./global/environment");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
// rutas
const post_1 = __importDefault(require("./rutas/post"));
const usuario_1 = __importDefault(require("./rutas/usuario"));
const mensajes_1 = __importDefault(require("./rutas/mensajes"));
// instanciamos la clase Server 
// const server = new Server(); // al poner private el constructor no se puede instanciar asi 
// con el patron singlenton se instancia asi :
const server = server_1.default.instance;
/// un middleware es una funcion que se ejecuta antes de otra 
/// body-parser 
// lo que sea que me posteen , tomalo y genera un obj de java script 
// config body.parser en el middle para enviar urlencoded
server.app.use(body_parser_1.default.urlencoded({ extended: true }));
// config body.parser en el middle para enviar formatos json
server.app.use(body_parser_1.default.json());
// fileupload : toma los archivos  y los coloca en files 
server.app.use(express_fileupload_1.default());
// colocamos esto en lugar de lo anterior , si guarda  files vacios 
//server.app.use(fileUpload({useTempFiles: true}));
// cors 
// cualquera puede llamar a mis servicios 
server.app.use(cors_1.default({ origin: true, credentials: true }));
//invocamos al middle use para la cte mensajes
//significa : que este pendiente del path /mensajes,
// y cuando haga la peticion a /mensajes , que trabaje con la ruta mensajesRoutes
server.app.use('/mensajes', mensajes_1.default);
//invocamos al middle use para la cte userRoutes
//significa : que este pendiente del path /user , 
// y cuando se haga la peticion a /user , que trabaje con la ruta userRoutes
server.app.use('/user', usuario_1.default);
//invocamos al middle use para la cte postRoutes
//significa : que este pendiente del path /posts , 
// y cuando haga la peticion a /posts , que trabaje con la ruta postRoutes
server.app.use('/posts', post_1.default);
// conectar base de datos mongo
//  {} es una configuracion de mongoose 
mongoose_1.default.connect(environment_1.urlDB, { useNewUrlParser: true, useCreateIndex: true }, (err) => {
    if (err)
        throw err; // tira un error y no sigue 
    console.log('Base de datos Online');
});
// arrancamos el server , la funcion fecha es un callback
// start esta en classes/server.ts
server.start(() => {
    //console.log(`Servidor corriendo en el puerto : ${SERVER_PORT}`);
});
