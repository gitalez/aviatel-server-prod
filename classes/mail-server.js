"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const email = __importStar(require("emailjs"));
class mailServer {
    constructor() { }
    enviarMailPasstemporal(correo, res, nuevoPasswordTemporal) {
        const dataHtml = this.construirHtmlCodigoIngreso(nuevoPasswordTemporal);
        this.sendMensaje(correo, dataHtml, res);
    }
    enviarMailConfirmCuenta(correo, res, codigoDeAcceso) {
        const dataHtml = this.construirHtmlConfirm(codigoDeAcceso);
        this.sendMensaje(correo, dataHtml, res, codigoDeAcceso);
    }
    construirHtmlCodigoIngreso(nuevoPasswordTemporal) {
        let dataHtml = '<html><body class= "container">';
        dataHtml += '<div style="width:100%; background:#eee; position:relative; font-family:sans-serif; padding-bottom:40px">';
        dataHtml += '<center>';
        dataHtml += '<h2 style="width:40%; font-weight:100; color:#FFFFF; margin-top: 50px; padding:20px 20px">';
        dataHtml += '<strong>AVIATEL</strong>';
        dataHtml += '</h2></center>';
        dataHtml += '<div style="position:relative; margin:auto; width:600px; background:white; padding:20px">';
        dataHtml += '<center><img style="padding:20px; width:15%" src="http://tutorialesatualcance.com/tienda/icon-pass.png">';
        dataHtml += '<h3 style="font-weight:100; color:#999">SOLICITUD DE NUEVA CONTRASEÑA</h3>';
        dataHtml += '<hr style="border:1px solid #ccc; width:80%">';
        dataHtml += '<h4 style="font-weight:100; color:#999; padding:0 20px">';
        dataHtml += '<strong>Su codigo de acceso : </strong>';
        dataHtml += '<span>';
        dataHtml += nuevoPasswordTemporal;
        dataHtml += '</span></h4>';
        dataHtml += '<p style="color:#999; padding:0 20px">(ingrese este codigo en el formulario  : "Ingresar nueva contraseña" de la app)</p>';
        dataHtml += '<div style="line-height:60px; background:#56f; width:80%; color:white">elija su nueva contraseña e ingrese en la app</div><br>';
        //dataHtml += '<a href="http://www.google.com" target="_blank" style="text-decoration:none">';
        //dataHtml += '<div style="line-height:60px; background:#56f; width:80%; color:white">Ingrese nuevamente al sitio</div></a><br>';
        dataHtml += '<hr style="border:1px solid #ccc; width:80%">';
        dataHtml += '<h5 style="font-weight:100; color:#999">Si no se inscribió en esta cuenta, puede ignorar este correo electrónico y la cuenta se eliminará.</h5>';
        dataHtml += '</center></div></div>';
        dataHtml += '</body></html>';
        //console.log(dataHtml);
        return dataHtml;
    }
    construirHtmlConfirm(codigoDeAcceso) {
        let dataHtml = '<html><body class= "container">';
        dataHtml += '<div style="width:100%; background:#eee; position:relative; font-family:sans-serif; padding-bottom:40px">';
        dataHtml += '<center>';
        dataHtml += '<h2 style="width:40%; font-weight:100; color:#FFFFF; margin-top: 50px; padding:20px 20px">';
        dataHtml += '<strong>AVIATEL</strong>';
        dataHtml += '</h2></center>';
        dataHtml += '<div style="position:relative; margin:auto; width:600px; background:white; padding:20px">';
        dataHtml += '<center><img style="padding:20px; width:15%" src="http://tutorialesatualcance.com/tienda/icon-pass.png">';
        dataHtml += '<h3 style="font-weight:100; color:#999">CONFIRMACION DE CORREO QUE HA DECLARADO</h3>';
        dataHtml += '<hr style="border:1px solid #ccc; width:80%">';
        dataHtml += '<h4 style="font-weight:100; color:#999; padding:0 20px">';
        dataHtml += '<strong>Su codigo de confirmacion de correo es : </strong>';
        dataHtml += '<span>';
        dataHtml += codigoDeAcceso;
        dataHtml += '</span></h4>';
        dataHtml += '<p style="color:#999; padding:0 20px">(ingrese este codigo en el formulario  : "Confirmacion de correo" de la app)</p>';
        dataHtml += '<div style="line-height:60px; background:#56f; width:80%; color:white">elija su nueva contraseña e ingrese en la app</div><br>';
        //dataHtml += '<a href="http://www.google.com" target="_blank" style="text-decoration:none">';
        //dataHtml += '<div style="line-height:60px; background:#56f; width:80%; color:white">haga click en este link para confirmar su correo</div></a><br>';
        dataHtml += '<hr style="border:1px solid #ccc; width:80%">';
        dataHtml += '<h5 style="font-weight:100; color:#999">Si no se registro en AiProg, puede ignorar este correo electrónico.</h5>';
        dataHtml += '</center></div></div>';
        dataHtml += '</body></html>';
        //console.log(dataHtml);
        return dataHtml;
    }
    sendMensaje(correo, dataHtml, res, codigoDeAcceso) {
        let message = {
            text: "",
            from: "aviatelnote@gmail.com",
            to: "alejandrozangari@gmail.com",
            subject: "nueva contraseña",
            attachment: [
                { data: dataHtml,
                    alternative: true
                }
            ]
        };
        let server = email.server.connect({
            user: "aviatelnote@gmail.com",
            password: "notegmail",
            host: "smtp.gmail.com",
            ssl: true,
            port: 465
        });
        server.send(message, (err, email) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "error al enviar el mail",
                    error: err
                });
            }
            if (!email) {
                return res.status(404).json({
                    ok: false,
                    mensaje: "no hay email"
                });
            }
            res.status(200).json({
                // ok
                ok: true,
                email: email,
                codigo: codigoDeAcceso
            });
        });
    }
}
exports.default = mailServer;
