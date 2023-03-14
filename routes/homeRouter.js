import express from 'express';
import homeControllers from "../controllers/homeControllers.js";
import sessionControllers from '../controllers/sessionControllers.js';

const homeRouter = express.Router();
homeRouter.use(sessionControllers.sessionPersistence);

homeRouter.get("/", homeControllers.getIndex);

homeRouter.get("/api/productos-test", homeControllers.getProductosTest);

export default homeRouter;