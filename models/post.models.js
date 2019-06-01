"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const postSchema = new mongoose_1.Schema({
    nombre: {
        type: String
    },
    created: {
        type: Date
    },
    comentario: {
        type: String
    },
    imgs: [{ type: String
        }],
    coords: {
        type: String
    },
    usuario: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'debe existir una ref al usuario']
    }
});
// pone la fecha automatica antes de salvar
postSchema.pre('save', function (next) {
    this.created = new Date();
    next();
});
exports.Post = mongoose_1.model('Post', postSchema);
