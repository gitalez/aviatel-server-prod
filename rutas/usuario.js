"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuario_model_1 = require("../models/usuario.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const token_1 = __importDefault(require("../classes/token"));
const environment_1 = require("../global/environment");
const autenticacion_1 = require("../middlewares/autenticacion");
const uniqid_1 = __importDefault(require("uniqid"));
const faker_1 = __importDefault(require("faker"));
const mail_server_1 = __importDefault(require("../classes/mail-server"));
const mailServer = new mail_server_1.default();
// Routes es una funcion que me permite crear objetos de tipo Router
const userRoutes = express_1.Router();
// los parametros de la funcion de flecha son los handlres 
// que van a manejar las respuestas 
// este metodo userRoutes sera invocado en el middleware  en index.ts
/// ruta de prueba para probar
// postman : localhost:5000/prueba
userRoutes.get('/prueba', (req, res) => {
    res.json({
        ok: true,
        mensaje: 'todo ok'
    });
});
/////////////////////// rutas de usuario /////////////////////////
//////////////////////////////////////
/// ruta para confirmar el mail 
// postman : localhost:5000/user/confirm-mail
userRoutes.post('/confirm-mail', (req, res) => {
    const codigoDeAcceso = faker_1.default.random.alphaNumeric(16);
    console.log('entramos en confirm-mail');
    mailServer.enviarMailConfirmCuenta(req.body.email, res, codigoDeAcceso);
});
//////////////////////////////////////
/// ruta para crear un usuario 
// postman : localhost:5000/user/create
// cuando creamos un usuario nuevo , generamos un token y se lo enviamos al cliente 
userRoutes.post('/create', (req, res) => {
    // generamos el dealer code de 6 digitos 
    const idDealer = uniqid_1.default();
    const largo = idDealer.length;
    let idTemp = idDealer.substr(largo - 4, 3);
    let dealerCode = `${idTemp}${new Date().getMilliseconds()}`;
    console.log('el code dealer es :', dealerCode);
    console.log('entramos en user create');
    // defino la info que tiene que venir del post 
    const user = {
        nombre: req.body.nombre,
        email: req.body.email,
        password: bcrypt_1.default.hashSync(req.body.password, 10),
        role: req.body.role,
        imagen: req.body.imagen,
        dealerCode: dealerCode
    };
    //mailServer.enviarMailConfirmCuenta(req.body.email, res);
    /// grabo en base de datos  DB 
    usuario_model_1.Usuario.create(user)
        .then(userDB => {
        const payload = {
            _id: userDB._id,
            nombre: userDB.nombre,
            email: userDB.email,
            imagen: userDB.imagen
        };
        const tokenUser = token_1.default.getJwtToken(payload);
        /// respuesta positiva 
        res.status(201).json({
            ok: true,
            token: tokenUser
        });
    })
        .catch(err => {
        if (err) {
            res.status(400).json({
                ok: false,
                mensaje: 'error al crear un usuario',
                error: err
            });
        }
    });
});
//////////////////////////////////////
/// ruta para login de  un usuario 
// postman : localhost:5000/user/login
// cuando se hace un login nuevo de un usuario existene
// se genera un nuevo token y se lo enviamos al cliente 
userRoutes.post('/login', (req, res) => {
    console.log('entramos en user login');
    const body = req.body; // extraemos todo lo que viene en el body
    console.log('BODY', body);
    //  en ({}) mientras el correo sea al body.email
    // significa encuentre el usuario cuyo email coincide con el body.email
    // encontrame uno donde el  email sea igual a dody.email
    usuario_model_1.Usuario.findOne({ email: body.email }, (err, userDB) => {
        if (err) {
            return res.status(500).json({
                // internal server error
                ok: false,
                mensaje: "error en BD al loguear",
                errors: err
            });
        }
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas ,email",
                errors: err
            });
        }
        // hasta aqui tenemos un correo valido
        // tenemos que comparar la contraseña ingresada
        // en userDB.password tenemos la contraseña encriptada
        // en body.password nos la dieron sin encriptar
        // el metodo comparesync encripta la del body y  la compara con las de DB
        if (!bcrypt_1.default.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas, password",
                errors: err
            });
        }
        // hata aqui tenemos un correo valido y una contraseña valida
        // en userDB viene el password , para que el password no sea parte del payload
        //lo cambiamos a una carita feliz
        console.log('userdeb', userDB);
        userDB.password = ":)";
        /// creamos el token
        const tokenUser = token_1.default.getJwtToken({
            _id: userDB._id,
            nombre: userDB.nombre,
            email: userDB.email,
            imagen: userDB.imagen
        });
        // le respondemos al cliente una respuesta positiva
        res.status(200).json({
            ok: true,
            mensaje: "login correcto",
            usuario: userDB,
            id: userDB._id,
            token: tokenUser,
            caducidad: environment_1.caducidad_Token,
            pass: userDB.password,
        });
    });
});
//////////////////////////////////////
/// ruta para update de un usuario 
// postman : localhost:5000/update
// este metodo no se deberia ejecutar a menos que el token sea valido
// creamos un  middleware para su verificacion 
// postman : localhost:5000/update 
// colocar en los headers de postman x-token : al token entregado cuando se crea o loguea el usuario 
userRoutes.post('/update', [autenticacion_1.verificaToken], (req, res) => {
    console.log('entramos en user update');
    // en el req viene a info que esta en el payload 
    // lo que ponemos aqui es lo que se va a actualizar
    // el ep || es por si algun campo viene vacio 
    const user = {
        nombre: req.body.nombre || req.usuario.nombre,
        email: req.body.email || req.usuario.email,
        imagen: req.body.imagen || req.usuario.imagen
    };
    //console.log('EL NOMBRE  AHORA ES : ' , user.nombre);
    // actualizamos al usuario
    // con new: true me envia mongoose la base actualizada 
    usuario_model_1.Usuario.findByIdAndUpdate(req.usuario._id, user, { new: true }, (err, userUpdate) => {
        if (err) {
            return res.status(500).json({
                // internal server error
                ok: false,
                mensaje: "error en BD al actualizar",
                errors: err
            });
        }
        if (!userUpdate) {
            return res.status(400).json({
                ok: false,
                mensaje: "el usuario a actualizar no existe",
                errors: err
            });
        }
        //genero un nuevo token, porque puede ser que al actualizar 
        //el usuario se cambiaron los datos del payload 
        const tokenUser = token_1.default.getJwtToken({
            _id: userUpdate._id,
            nombre: userUpdate.nombre,
            email: userUpdate.email,
            imagen: userUpdate.imagen
        });
        // respondo al cliente una respuesta positiva
        res.status(200).json({
            ok: true,
            mensaje: "actualizacion correcta",
            usuario: userUpdate,
            id: userUpdate._id,
            token: tokenUser,
            caducidad: environment_1.caducidad_Token,
        });
    });
});
// ruta para obtener la info del usuario por su token
// postman : localhost:5000/user/token
// si el token no es valido verificatoken d¡se encarga de poner :
//   "ok": false,
//   "mensaje": "token no valido"
userRoutes.get('/token', [autenticacion_1.verificaToken], (req, res) => {
    console.log('entramos en user token');
    const usuario = req.usuario; // viene en el req gracias al verificatoken 
    res.status(200).json({
        ok: true,
        usuario
    });
});
/////////////////////////////////////////////////////
// ruta para verificar si el email esta en base y luego enviar un mail  con la nueva pass temporal 
// graba en base de datos el el passtemporal encriptado que envia al cliente 
// metodo : post
// en post man : http://localhost:5000/user/recuperar-pass
/////////////////////////////////////////////////////
userRoutes.post('/recuperar-pass', (req, res) => {
    console.log('el mail recibido es :', req.body.email);
    let nuevoPasswordTemporal = faker_1.default.random.alphaNumeric(16);
    var nuevoPasswordTemporalEncriptado = bcrypt_1.default.hashSync(nuevoPasswordTemporal, 10);
    const email = req.body.email;
    // verificamos si existe en nuestra base de datos el Sr
    usuario_model_1.Usuario.findOne({ email })
        .exec((err, usuario) => {
        if (err) {
            return res.status(500).json({
                // internal error server
                ok: false,
                mensaje: "error en base de datos",
                error: err
            });
        }
        if (!usuario) {
            return res.status(404).json({
                // not found
                ok: false,
                mensaje: "correo no registrado en nuestra base de datos",
                error: err
            });
        }
        // salvamos una contraseña temporal encriptda
        // para luego comparararla con la que enviara el usuario
        let id = usuario._id;
        usuario_model_1.Usuario.findById(id, (err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    // internal server
                    ok: false,
                    mensaje: "el usuario con el id" + id + "no existe",
                    errors: err
                });
            }
            if (!usuarioDB) {
                return res.status(400).json({
                    // bad request
                    ok: false,
                    mensaje: "no se pudo actualizar la contraseña con el id :" + id
                });
            }
            //passwordTemporal es la propiedad que esta en el mongo models
            usuarioDB.passwordTemporal = nuevoPasswordTemporalEncriptado;
            usuarioDB.save((err, usuarioUpdated) => {
                if (err) {
                    return res.status(400).json({
                        // bad request
                        ok: false,
                        mensaje: "error al actualizar el usuario",
                        error: err
                    });
                }
                //console.log('enviando correo');
                // enviamos un mail al comitente que necesita un nuevo password
                // hay un usuario registrado  con ese mail
                return mailServer.enviarMailPasstemporal(email, res, nuevoPasswordTemporal);
            });
        });
    });
});
/////////////////////////////////////////////////////
// aqui el cliente envia su email , el codigo de acceso que recibio y un nuevo pass que el eligio
// compar el codico de acceso que esta en base de datos con el que vino 
// metodo : post
// en post man : http://localhost:5000/user/nuevo-pass
/////////////////////////////////////////////////////
userRoutes.post('/nuevo-pass', (req, res) => {
    console.log('entramos en user token');
    // las ctes son las que estan declaradas en el modelo de mongo
    const passwordTemporal = req.body.passwordTemporal;
    const email = req.body.emailArecuperar;
    const passWord = req.body.nuevoPass;
    usuario_model_1.Usuario.findOne({ email }) // encuentro por el email el usuario que quiere cambiar su pass
        .exec((err, usuario) => {
        if (err) {
            return res.status(500).json({
                // internal error server
                ok: false,
                mensaje: "error en base de datos",
                error: err
            });
        }
        if (!usuario) {
            return res.status(404).json({
                // not found
                ok: false,
                mensaje: "correo no registrado en nuestra base de datos",
                error: err
            });
        }
        // encontre un email valido , obtengo su ID
        let id = usuario._id; // usuario me devuelve su id
        usuario_model_1.Usuario.findById(id, (err, usuarioDB) => {
            if (err) {
                return res.status(500).json({
                    // internal server
                    ok: false,
                    mensaje: "el usuario con el id" + id + "no existe",
                    errors: err
                });
            }
            if (!usuarioDB) {
                return res.status(400).json({
                    // bad request
                    ok: false,
                    mensaje: "usuario no registrado en base de datos"
                });
            }
            // aqui tengo que 
            //verificar que el temporal enviado coincide con el  temporal guardado 
            // si coincide copiar el password temporal al password principal y luego borrar el temporal
            // en usuarioDB.passwordTemporal tenemos la contraseña encriptada en la base de datos
            // en body.password  = passwordTemporal nos la dieron sin encriptar
            // el metodo comparesync encripta la del body y  la compara con las de DB
            if (!bcrypt_1.default.compareSync(passwordTemporal, usuarioDB.passwordTemporal)) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "codigo de acceso incorrecto",
                    errors: err
                });
            }
            else {
                // el codigo de acceso enviado coincide con el que esta registrado en base de datos 
                usuarioDB.password = bcrypt_1.default.hashSync(passWord, 10),
                    usuarioDB.passwordTemporal = '';
                usuarioDB.save((err, usuarioUpdated) => {
                    if (err) {
                        return res.status(400).json({
                            // bad request
                            ok: false,
                            mensaje: "error al actualizar el usuario",
                            error: err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        usuario: usuarioUpdated,
                    });
                });
            }
            ;
        });
    });
});
// hay que exportarlo para que el index lo vea
exports.default = userRoutes;
