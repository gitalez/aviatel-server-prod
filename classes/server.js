"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const environment_1 = require("../global/environment");
const socket_io_1 = __importDefault(require("socket.io"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
// clase server 
// default :  es lo unico que voy a exportar , exporto el paquete por defecto 
class Server {
    constructor() {
        this.app = express_1.default(); // inicializo app , que ahora tiene todos los metodos de express
        this.port = environment_1.SERVER_PORT;
        // SOCKET Y EXPRESS NO TRABAJAN JUNTOS , no son compatibles . hay que intermediar con http 
        // express levanta un servidor http 
        // creamos una private httpServer que es el servidor que vamos a levenmtar y no el app : expreess.Aplication
        // como hasta ahora 
        this.httpServer = new http_1.default.Server(this.app); // le pasamos la configuracion de app  de express 
        // configuramos el io que es la referencia a nuestro servidor 
        this.io = socket_io_1.default(this.httpServer);
        this.escucharSockets();
    }
    // si ya existe una instancia , regresa esa instancia 
    // si no existe o si es la primera vez que se llama a esta funcion 
    // crea una nueva instancia con el this() o Server()
    static get instance() {
        //retorno la _instance si existe o sino 
        // regreso  una _instance al server 
        // this() es equivalnte a poner Server()
        return this._instance || (this._instance = new this());
    }
    //// escuchamos los socket 
    escucharSockets() {
        console.log('escuchando conexiones-socket de clientes');
        // voy a escuchar el connection 
        // io es nuestro servidor de socket
        this.io.on('connection', cliente => {
            console.log('Nuevo cliente conectado');
        });
    }
    publicFolder() {
        // este es el path donde va a estar la carpeta publica
        const publicPath = path_1.default.resolve(__dirname, '../public');
        this.app.use(express_1.default.static(publicPath));
    }
    // METODO PARA LEVANTAR EL SERVIDOR 
    // creamos el metodo start que recibe un callback que se lo pasamos a listen 
    start(callback) {
        // asi se inicializa el servidor sin socket 
        //this.app.listen(this.port, callback);  
        // asi se inicializa con socket 
        this.httpServer.listen(this.port);
        this.publicFolder();
        console.log('Servidor corriendo en el puerto :', this.port);
        //console.log(dialogflow_token);
    }
}
exports.default = Server;
