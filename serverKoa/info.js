import Router from "koa-router";
import infoServices from "../services/infoServices.js";

const info = new Router({
    prefix: "/koaInfo"
});

info.get("/no-bloqueante", ctx => {
    ctx.type = "html";
    ctx.body = infoServices.getHtmlProcessInfo();
});

info.get("/bloqueante", ctx => {
    infoServices.getProcessInfo();
    ctx.type = "html";
    ctx.body = infoServices.getHtmlProcessInfo();
});

export default info;