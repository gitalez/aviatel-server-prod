"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_unique_validator_1 = __importDefault(require("mongoose-unique-validator"));
// con este objeto permito los roles siguiente
let rolesValidos = {
    values: ['consumer', 'resellers', 'empleado', 'admin', 'super', 'iot', 'dispositivo'],
    messages: '{VALUE} no es un role valido' // value es lo que la persona escribe
};
let estadosValidos = {
    values: ['activo', 'suspendido'],
    messages: '{VALUE} no es un estado valido' // value es lo que la persona escribe
};
/*
Todo en Mongoose comienza con un Esquema.
Cada esquema se asigna a una colección MongoDB
y define la forma de los documentos dentro de esa colección.
*/
//let Schema = mongoose.Schema; // define el modelo
// declaramos un nuevo schema
// definimos las reglas y campos que el usuarioschema va a tener 
const usuarioSchema = new mongoose_1.Schema({
    nombre: {
        type: String,
        required: [true, 'el nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'el correo es requerido']
    },
    password: {
        type: String,
        required: [true, 'la contraseña es obligatoria']
    },
    passwordTemporal: {
        type: String,
        required: false,
        default: null
    },
    cuentaVerificada: {
        type: Boolean,
        required: false,
        default: false
    },
    emailEncriptado: {
        type: String,
        required: false,
        default: null
    },
    imagen: {
        type: String,
        required: false,
        default: 'av-1.png' // es un avatar predefinido que estara en la app de ionic
    },
    role: {
        type: String,
        required: [true, 'el rol es necesario'],
        enum: rolesValidos,
    },
    estado: {
        type: String,
        required: false,
        //required:[true, 'el estado es necesario'],
        enum: estadosValidos,
    },
    google: {
        type: Boolean,
        required: false,
        default: false
    },
    sala: {
        type: String,
        required: false,
        default: 'sin-sala'
    },
    dealerCode: {
        type: String,
        required: false,
        default: ''
    }
});
// optamos por nunca devolver el password
// este objeto no tiene la contraseña
// no usamos la funcion flecha para no perder el this 
// exclusion de devolver la contraseña del modelo  mediante el schema 
usuarioSchema.methods.toJSON = function () {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
};
// OTRA FORMA 
// es colocar el find  en el controller asi 
//Usuario.find({}, 'nombre email img role')
//.exec((err,usaurio)=>)
// importamos con npm el unique validator
// le decimos al usuarioschema que use el plugin unique mediante el mensaje 
// path reemplaza la propiedad del campo 
usuarioSchema.plugin(mongoose_unique_validator_1.default, { message: '{PATH} ya registrado' });
// exportamos este modelo como Usuario que va a tener toda la configuracion de usuarioSchema
exports.Usuario = mongoose_1.model('Usuario', usuarioSchema);
