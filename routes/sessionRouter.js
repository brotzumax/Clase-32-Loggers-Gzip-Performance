import express from 'express';
import controllers from "../controllers/sessionControllers.js"

const sessionRouter = express.Router();

sessionRouter.get("/login", controllers.getLogin);

sessionRouter.post("/login", controllers.postLogin);

sessionRouter.get("/logout", controllers.getLogout);

export default sessionRouter;