import Koa from "koa";
import { koaBody } from "koa-body";
import views from "koa-views";
import session from "koa-session";
import IO from "koa-socket-2";

import sessions from "./serverKoa/sessions.js";
import home from "./serverKoa/home.js";
import info from "./serverKoa/info.js";

import ProductosApi from "./services/ProductosAPI.js";
const productosApi = new ProductosApi();

const app = new Koa();
const io = new IO();

app.use(koaBody());

app.use(views("./views/pages", {
    extension: "ejs"
}));

app.keys = ['secreto'];
app.use(session(app));

app.use(sessions.routes());
app.use(home.routes());
app.use(info.routes());


io.attach(app);

io.on('connection', async function (socket) {
    const productos = await productosApi.getProducts();
    socket.emit('productos', productos);

    /* const mensajesNormalizados = normalizrServices.normalize(mongooseMessages.getAllMessages(), normalizrServices.mensajeria);
    io.sockets.emit('mensajes', mensajesNormalizados); */


    socket.on("nuevo-producto", async producto => {
        const productos = await productosApi.getProducts(producto);
        socket.emit('productos', productos);
    });

    socket.on("nuevo-mensaje", message => {
        /* const mensajesNormalizados = normalizrServices.normalize(mongooseMessages.newMessage(message), normalizrServices.mensajeria);
        io.sockets.emit('mensajes', mensajesNormalizados); */
    })
});

const server = app.listen(8080, () => {
    console.log(`Servidor Koa escuchando en el puerto ${server.address().port}`);
});