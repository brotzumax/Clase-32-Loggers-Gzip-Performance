import logger from "../services/winstonServices.js";

function getUrlInfo(req, res, next) {
    logger.info(`Request to ${req.url} - Method: ${req.method}`);
    next();
}

function urlNotFound(req, res) {
    logger.warn(`Petición ${req.url} no encontrada`);
    res.redirect("/home");
}

export default { getUrlInfo, urlNotFound };