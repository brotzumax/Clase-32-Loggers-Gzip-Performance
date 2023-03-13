import express from 'express';

const sessionRouter = express.Router();

sessionRouter.get("/login", (req, res) => {
    res.render("pages/login");
});

sessionRouter.post("/login", (req, res) => {
    req.session.user = req.body.txtUsuario;
    res.redirect('/');
});

sessionRouter.get("/logout", (req, res) => {
    res.render("pages/logout", { username: req.session.user });
    req.session.destroy();
});

export default sessionRouter;