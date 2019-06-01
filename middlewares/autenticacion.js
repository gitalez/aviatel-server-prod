"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = __importDefault(require("../classes/token"));
exports.verificaToken = (req, res, next) => {
    // recibimos el token en los headers de la peticion 
    // el key lo llamaremos : x-token
    // con el metodo get obtenemos cualquier headers 
    // colocamos un '' en caso que no envien un token desde el cliente 
    const userToken = req.get('x-token') || '';
    token_1.default.comprobarToken(userToken)
        .then((resultado) => {
        console.log('token valido');
        req.usuario = resultado.usuario;
        next(); // exito, continuamos con la funcion que lo llamo 
    })
        .catch(err => {
        console.log('token no valido');
        // respondo que no es valido para que la app lo resuelva
        res.status(400).json({
            ok: false,
            mensaje: 'token no valido'
        });
    });
};
