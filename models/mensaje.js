import mongoose from "mongoose";

const mensajeSchema = new mongoose.Schema({
    author: { type: Object, require: true },
    text: { type: String },
    date: { type: String }
})

export const modeloMensaje = mongoose.model('Mensaje', mensajeSchema);