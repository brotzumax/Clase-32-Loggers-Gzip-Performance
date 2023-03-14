import infoServices from "../services/infoServices.js";

function getInfoNoBloqueante(req, res) {
    res.send(infoServices.getHtmlProcessInfo());
}

function getInfoBloqueante(req, res) {
    infoServices.getProcessInfo();
    res.send(infoServices.getHtmlProcessInfo());
}

export default { getInfoNoBloqueante, getInfoBloqueante };