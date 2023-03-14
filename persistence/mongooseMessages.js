import mongoose from "mongoose";
import options from "../options/mongodbconn.js";
import mensajeModel from '../models/mensaje.js';

function convertirArray(array) {
    let nuevoArray = [];
    for (mensaje of array) {
        nuevoArray.push({ id: mensaje._id.toString(), author: mensaje.author, text: mensaje.text, date: mensaje.date });
    };
    return nuevoArray;
}

function getAllMessages() {
    mongoose.set('strictQuery', true);
    mongoose.connect("mongodb://localhost:27017/mensajeria", options)
        .then(() => mensajeModel.find({}))
        .then(data => {
            return chat = {
                id: "mensajes",
                messages: convertirArray(data)
            }
        })
        .catch(err => console.log(err));
}

function newMessage(message) {
    mongoose.set('strictQuery', true);
    mongoose.connect("mongodb://localhost:27017/mensajeria", options)
        .then(() => mensajeModel.create(message))
        .then(() => console.log("Mensaje guardado"))
        .then(() => mensajeModel.find({}))
        .then(data => {
            return chat = {
                id: "mensajes",
                messages: convertirArray(data)
            };
        })
        .catch(err => console.log(err));
}

export default { getAllMessages, newMessage }