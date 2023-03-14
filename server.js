//Requisitos
import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { ClienteSQL } from './db/sqlContainer.js';
import { options as optionsMariaDB } from './options/mysqlconn.js';

//MongoDB
import mongoose from 'mongoose';
import { options as mongoConfig } from './options/mongodbconn.js';
import { modeloMensaje } from './models/mensaje.js';

//Normalizr
import normalizr from 'normalizr';
const normalize = normalizr.normalize;
const schema = normalizr.schema;

//Esquemas normalizacion
const author = new schema.Entity('authors', {}, { idAttribute: 'email' });
const message = new schema.Entity('messages', { author: author }, { idAttribute: 'id' });
const mensajeria = new schema.Entity('mensajeria', { messages: [message] }, { idAttribute: 'id' });

//Cookies
import cookieParser from 'cookie-parser';

//Session
import session from 'express-session';
import MongoStore from 'connect-mongo';
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };

//Métodos
function convertirArray(array) {
    let nuevoArray = [];
    for (mensaje of array) {
        nuevoArray.push({ id: mensaje._id.toString(), author: mensaje.author, text: mensaje.text, date: mensaje.date });
    };
    return nuevoArray;
}

//.env
import 'dotenv/config';

//Minimist
import minimist from 'minimist';
const argsOptions = { alias: { p: 'puerto', m: 'modo' }, default: { puerto: 8080, modo: "FORK" } };
const args = minimist(process.argv.slice(2), argsOptions);

//Cluster
import cluster from 'cluster';
import numCPUs from './services/osServices.js';

//Gzip
import compression from 'compression';

//Winston
import logger from './services/winstonServices.js';
import winstonControllers from './controllers/winstonControllers.js';




//Inicio de servidor
const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        mongoOptions: advancedOptions
    }),
    secret: 'secreto',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));

app.use(compression());

//Middleware winston
app.use(winstonControllers.getUrlInfo);

let sqlProductos = new ClienteSQL(optionsMariaDB, "productos");

//Routes
import sessionRouter from './routes/sessionRouter.js';
import homeRouter from './routes/homeRouter.js';
import infoRouter from './routes/infoRouter.js';
app.use('/session', sessionRouter);
app.use('/home', homeRouter);
app.use('/info', infoRouter);

//Midleware para peticiones no encontradas
app.use(winstonControllers.urlNotFound);

//Websocket
io.on('connection', function (socket) {
    console.log("Cliente conectado");

    sqlProductos = new ClienteSQL(optionsMariaDB, "productos");
    sqlProductos.obtenerProductos()
        .then(productos => socket.emit('productos', productos));

    mongoose.set('strictQuery', true);
    mongoose.connect("mongodb://localhost:27017/mensajeria", mongoConfig)
        .then(() => modeloMensaje.find({}))
        .then(data => {
            const chat = {
                id: "mensajes",
                messages: convertirArray(data)
            };
            const mensajesNormalizados = normalize(chat, mensajeria);
            io.sockets.emit('mensajes', mensajesNormalizados);
        })
        .catch((err) => logger.error(err));



    socket.on("nuevo-producto", producto => {
        sqlProductos = new ClienteSQL(optionsMariaDB, "productos");
        sqlProductos.insertarElemento(producto)
            .then(() => sqlProductos.obtenerProductos())
            .then(productos => socket.emit('productos', productos));
    });

    socket.on("nuevo-mensaje", message => {
        mongoose.set('strictQuery', true);
        mongoose.connect("mongodb://localhost:27017/mensajeria", mongoConfig)
            .then(() => modeloMensaje.create(message))
            .then(() => console.log("Mensaje guardado"))
            .then(() => modeloMensaje.find({}))
            .then(data => {
                const chat = {
                    id: "mensajes",
                    messages: convertirArray(data)
                };
                const mensajesNormalizados = normalize(chat, mensajeria);
                io.sockets.emit('mensajes', mensajesNormalizados);
            })
            .catch((err) => logger.error(err));
    })
});

//Escucha del servidor
if (args.modo === "FORK") {
    console.log("Servidor modo fork");
    httpServer.listen(args.puerto, () => {
        console.log(`Servidor escuchando en puerto ${args.puerto}`);
    });
} else if (args.modo === "CLUSTER") {
    if (cluster.isMaster) {
        console.log("Servidor modo cluster");
        console.log(`Master ${process.pid} is running`);

        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died`);
        });
    } else {
        httpServer.listen(args.puerto, () => {
            console.log(`Servidor escuchando en puerto ${args.puerto}`);
        });
        console.log(`Worker ${process.pid} started`);
    }
} else {
    console.log(`${args.modo} no es un modo compatible (FORK - CLUSTER)`);
}

