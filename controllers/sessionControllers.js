function getLogin(req, res) {
    res.render("pages/login");
}

function postLogin(req, res) {
    const username = req.body.txtUsuario;
    req.session.user = username;
    res.redirect('/');
}

function getLogout(req, res) {
    res.render("pages/logout", { username: req.session.user });
    req.session.destroy();
}

export default {
    getLogin,
    postLogin,
    getLogout
}