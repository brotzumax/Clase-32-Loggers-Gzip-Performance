import Router from "koa-router";

const home = new Router({
    prefix: "/koaHome"
});

home.get("/", ctx => {
    return ctx.render("index", { username: ctx.session.user });
});

home.get("/api/productos-test", ctx => {
    return ctx.render("testView");
});

export default home;