//Requisitos
import express from 'express';
import fs from 'fs';
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
import util from 'util';

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


//Fork
import { fork } from 'child_process';

//Cluster
import cluster from 'cluster';
import os from 'os';
const numCPUs = os.cpus().length;

//Gzip
import compression from 'compression';

//Winston
import winston from 'winston';

const logger = winston.createLogger({
    level: 'verbose',
    transports: [
        new winston.transports.Console({ level: 'info' }),
        new winston.transports.File({ filename: 'warn.log', level: 'warn' }),
        new winston.transports.File({ filename: 'error.log', level: 'error' })
    ]
});


//Inicio de servidor
const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

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
app.use((req, res, next) => {
    logger.info(`Request to ${req.url} - Method: ${req.method}`);
    next();
});


let sqlProductos = new ClienteSQL(optionsMariaDB, "productos");


//Ejs
app.set('view engine', 'ejs');

//Routes
import sessionRouter from './routes/sessionRouter.js';
import homeRouter from './routes/homeRouter.js';
app.use('/session', sessionRouter);
app.use('/home', homeRouter);

//Peticiones del servidor
app.get("/info", (req, res) => {
    res.send(
        "<h1>Información de la aplicación</h1>" +
        "<div style='display: flex; flex-direction: column'>" +
        "<span>Argumentos de entrada: -p (puerto), -m (modo: FORK - CLUSTER)</span>" +
        `<span>Nombre de la plataforma: ${process.platform}</span>` +
        `<span>Versión de node.js: ${process.version}</span>` +
        `<span>Memoria total reservada (rss): ${process.memoryUsage().rss}</span>` +
        `<span>Path de ejecución:  ${process.execPath}</span>` +
        `<span>Process id: ${process.pid}</span>` +
        `<span>Carpeta del proyecto: ${process.cwd()}</span>` +
        `<span>Número de procesadores: ${numCPUs}</span>` +
        "</div>"
    );
});

const processInfo = {
    platform: process.platform,
    version: process.version,
    memoryUsage: process.memoryUsage().rss,
    execPath: process.execPath,
    pid: process.pid,
    cwd: process.cwd(),
    numCPUs: numCPUs,
}

app.get("/bloqInfo", (req, res) => {
    console.log(processInfo);
    res.send(
        "<h1>Información de la aplicación</h1>" +
        "<div style='display: flex; flex-direction: column'>" +
        "<span>Argumentos de entrada: -p (puerto), -m (modo: FORK - CLUSTER)</span>" +
        `<span>Nombre de la plataforma: ${process.platform}</span>` +
        `<span>Versión de node.js: ${process.version}</span>` +
        `<span>Memoria total reservada (rss): ${process.memoryUsage().rss}</span>` +
        `<span>Path de ejecución:  ${process.execPath}</span>` +
        `<span>Process id: ${process.pid}</span>` +
        `<span>Carpeta del proyecto: ${process.cwd()}</span>` +
        `<span>Número de procesadores: ${numCPUs}</span>` +
        "</div>"
    );
});

//Midleware para peticiones no encontradas
app.use((req, res) => {
    logger.warn(`Petición ${req.url} no encontrada`);
    res.redirect("/home");
});

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

