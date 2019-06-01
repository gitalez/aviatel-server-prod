"use strict";
// =============================
// puerto
//==============================
Object.defineProperty(exports, "__esModule", { value: true });
// si el puerto lo entrega heroku es process.env.PORT
//si no existe el process.env.PORT va a ser = a 5000
// esto se copia en SERVER_PORT
// process.env.PORT es una variable de entorno de heroku 
// si corre en local es puerto 5000 
// sino la define heroku 
// da error de casting 
//export const SERVER_PORT: number = process.env.PORT || 3000
exports.SERVER_PORT = Number(process.env.PORT) || 5000;
// =============================
// entorno
//==============================
// si process.env.Node_env no existe supongo que estoy en desarrollo
// esta enviroment  es de heroku 
//esto significa  si process.env.node_env no existe supongo que estoy en desarrollo
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
// =============================
//  base de datos 
//==============================
// para probar  que funcione en mlab comento el if 
// si mongo no encuentra el nombre de la base que ponemos la crea
let urldb;
if (process.env.NODE_ENV === 'dev') {
    urldb = 'mongodb://localhost:27017/aviatel_DB';
}
else {
    urldb = process.env.MONGO_URI;
}
// la cadena es por ejemplo ( que se define en mlab )
//'mongodb://user-esp:123456esp@ds127342.mlab.com:27342/api-esp'
//cuando inicializamos heroku en alguna parte hacemos : 
// le pasamos la mongo uri 
// de esta manera no se ve en el repositorio 
// le enviamos la cadena de conexion a gtraves de la variable de proeceso MONGO_URI
//heroku config:set MONGO_URI="mongodb://db-aviatel-user:db-123456-aviatel@ds133358.mlab.com:33358/db-aviatel"
// =============================
// vencimiento del token
//==============================
// 60 seg
// 60 min
// 24 horas
// 30 dias
// 1000 en ms 
// minimo 2 horas , porque el front end verifica con resolucioon de 1 hora
const cad_Token = process.env.CADUCIDAD_TOKEN = '30d'; // 30dias 
//process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30 * 1000; //  equivale a 1 mes
// =============================
// SEED  de autentificacion
//==============================
// si process.env.SEED no existe le paso el string
// sino la variable de entorno es la que defino en heroku
// la var de proceso SEED hay que declararla en heroku // ver heroku 
// algo asi 
//heroku config:set process.env.SEED ="seed-remoto"
// so , cuando esta corriendo en heroku tomara : seed-remoto
// y no :  seed-local
// obvio que no  sera esta xque este file se sube a github 
// nadie la tiene que conocer 
//const seed_env = process.env.SEED = process.env.SEED || 'seed-local';
const seed_env = process.env.SEED || 'seed-local';
// =============================
// TOKE de dialogflow
//==============================
// defino la variable de entorno  token de dialogflow ( dada en la pagina web)
// y luego la exporto como dialogflow_token para ser usuada en otros modulos
const dialog_flow_token = process.env.DIALOGFLOW_ACCESS_TOKEN = 'af5a92edd9354cfca64bd1443e14ae07';
exports.dialogflow_token = String(dialog_flow_token);
exports.urlDB = String(urldb);
exports.caducidad_Token = String(cad_Token);
exports.mi_seed = String(seed_env);
