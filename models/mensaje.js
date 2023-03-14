import mongoose from "mongoose";

const mensajeSchema = new mongoose.Schema({
    author: { type: Object, require: true },
    text: { type: String },
    date: { type: String }
});

const mensajeModel = mongoose.model('Mensaje', mensajeSchema);

export default mensajeModel;