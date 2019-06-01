"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const environment_1 = require("../global/environment");
//process.env.DIALOGFLOW_ACCESS_TOKEN
class Dialogflow {
    constructor() {
    }
    send(message) {
        console.log('enviando mensje a dialog');
        const accessToken = environment_1.dialogflow_token;
        //const baseURL = 'https://dialogflow-sniuoi@small-talk-a652b.iam.gserviceaccount.com';
        const baseURL = 'https://api.dialogflow.com/v1/query?v=20150910';
        const data = {
            query: message,
            lang: 'es',
            sessionId: '123456789!@#$%'
        };
        return axios_1.default.post(baseURL, data, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
    }
}
exports.default = Dialogflow;
