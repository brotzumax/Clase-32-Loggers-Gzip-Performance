//Requisitos
import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { options as optionsMariaDB } from './options/mysqlconn.js';

//MongoDB
import mongooseMessages from "./persistence/mongooseMessages.js";

//Cliente SQL
import { ClienteSQL } from './db/sqlContainer.js';
let sqlProductos = new ClienteSQL(optionsMariaDB, "productos");

//Normalizr
import normalizrServices from './services/normalizrServices.js';

//Cookies
import cookieParser from 'cookie-parser';

//Session
import session from 'express-session';
import MongoStore from 'connect-mongo';
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true };

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
    sqlProductos = new ClienteSQL(optionsMariaDB, "productos");
    sqlProductos.obtenerProductos()
        .then(productos => socket.emit('productos', productos));

    const mensajesNormalizados = normalizrServices.normalize(mongooseMessages.getAllMessages(), normalizrServices.mensajeria);
    io.sockets.emit('mensajes', mensajesNormalizados);


    socket.on("nuevo-producto", producto => {
        sqlProductos = new ClienteSQL(optionsMariaDB, "productos");
        sqlProductos.insertarElemento(producto)
            .then(() => sqlProductos.obtenerProductos())
            .then(productos => socket.emit('productos', productos));
    });

    socket.on("nuevo-mensaje", message => {
        const mensajesNormalizados = normalizrServices.normalize(mongooseMessages.newMessage(message), normalizrServices.mensajeria);
        io.sockets.emit('mensajes', mensajesNormalizados);
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

