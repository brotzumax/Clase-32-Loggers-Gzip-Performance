import Router from "koa-router";

const sessions = new Router({
    prefix: "/koaSessions"
});

sessions.get("/login", ctx => {
    return ctx.render("login");
});
sessions.post("/login", ctx => {
    const username = ctx.request.body.txtUsuario;
    ctx.session.user = username;
    ctx.redirect('/koaHome');
});

sessions.get("/logout", ctx => {
    const username = ctx.session.user;
    return ctx.render("logout", { username: username });
});

export default sessions;