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
// estas rutas mensajes fueron de prueba , por ahora no se usan
const express_1 = require("express");
const pusher_1 = __importDefault(require("pusher"));
const shortid_1 = __importDefault(require("shortid"));
const dialogflow_1 = __importDefault(require("../classes/dialogflow"));
// creamos una instancia de la clase Dialogflow
const dialogflow = new dialogflow_1.default();
//import  * as dotenv from 'dotenv';
//dotenv.config({path: 'dotenv'});
// router es una funcion que me permite crear objetos de tipo Router
const mensajesRoutes = express_1.Router();
const pusher = new pusher_1.default({
    appId: '785399',
    key: '027f189437a85167c79f',
    secret: '0873ec99e4a237207952',
    cluster: 'us2',
    encrypted: true
});
// los parametros de la funcion de flecha son los handlres que van a manejar las respuestas 
// este metodo rutas sera  invocado en el middleware  en index.ts
// con metod get 
// en postman : localhost:5000/mensaje1
mensajesRoutes.get('/mensaje1', (req, res) => {
    // respuesta al cliente 
    res.json({
        ok: true,
        mensaje: 'todo bien por get'
    });
});
// con metod post 
// en postman : localhost:5000/mensajes/mensaje2
// tildamos en postman  urlencoded en el body  
// coloco 
//cuerpo : hola
// de : alex
mensajesRoutes.post('/mensaje2', (req, res) => {
    console.log('entramos en mensaje2');
    const cuerpo = req.body.cuerpo;
    const de = req.body.de;
    // respuesta al cliente 
    res.json({
        ok: true,
        cuerpo: cuerpo,
        de: de
    });
});
/// servicio donde leer un parametro de la url 
// id es un parametro que se pasa por la url 
// con metod post 
// en postman : localhost:5000/mensajes3/abc
// tildamos en postman  urlencoded en el body  
// coloco 
//cuerpo : hola
// de : alex
mensajesRoutes.post('/mensaje3/:id', (req, res) => {
    const id = req.params.id;
    const cuerpo = req.body.cuerpo;
    const de = req.body.de;
    // respuesta al cliente 
    res.json({
        ok: true,
        cuerpo: cuerpo,
        de: de,
        parametro: id
    });
});
// en postman : localhost:5000/mensajes/message-pusher
// tildamos en postman  urlencoded en el body  
// coloco 
//message : hola
mensajesRoutes.post('/message-pusher', (req, res) => __awaiter(this, void 0, void 0, function* () {
    console.log('entramos en message-pusher');
    //const mensaje = req.body.message;
    //console.log(mensaje);
    console.log(req.body);
    const chat = Object.assign({}, req.body, { id: shortid_1.default.generate(), createdAt: new Date().toISOString() });
    //update pusher listeners
    pusher.trigger('chat-bot', 'chat', chat);
    const message = chat.message;
    const response = yield dialogflow.send(message);
    console.log('dialog respondio ', response.data.result.fulfillment);
    // trigger this update to our pushers listeners
    pusher.trigger('chat-bot', 'chat', {
        message: `${response.data.result.fulfillment.speech}`,
        type: 'bot',
        createdAt: new Date().toISOString(),
        id: shortid_1.default.generate()
    });
    res.send(chat);
}));
// hay que exportarlo para que el index lo vea
exports.default = mensajesRoutes;
