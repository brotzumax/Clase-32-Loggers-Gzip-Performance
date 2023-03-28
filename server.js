//Requisitos
import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';

//MongoDB
import mongooseMessages from "./persistence/mongooseMessages.js";

//Productos API
const productosApi = new ProductosApi();

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
import winstonControllers from './controllers/winstonControllers.js';

//Productos Api
import ProductosApi from './services/ProductosAPI.js';


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

//Axios Test
app.get("/products/getAll", async (req, res) => {
    try {
        const productos = await productosApi.getProducts();
        res.send(productos);
    } catch (error) {
        res.send({ error: error });
    }
});

app.put("/products/update", async (req, res) => {
    try {
        const data = req.body;
        await productosApi.updateProduct(data);
        res.send({ status: "Producto actualizado" });
    } catch (error) {
        res.send({ error: error });
    }
});

//Midleware para peticiones no encontradas
app.use(winstonControllers.urlNotFound);

//Websocket
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

