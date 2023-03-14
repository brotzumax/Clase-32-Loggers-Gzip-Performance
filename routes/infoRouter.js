import express from 'express';
import infoControllers from '../controllers/infoControllers.js';

const infoRouter = express.Router()

infoRouter.get("/no-bloqueante", infoControllers.getInfoNoBloqueante);

infoRouter.get("/bloqueante", infoControllers.getInfoBloqueante);

export default infoRouter;