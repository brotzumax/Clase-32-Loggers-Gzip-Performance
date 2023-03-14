import numCPUs from "./osServices.js";

function getProcessInfo() {
    const processInfo = {
        platform: process.platform,
        version: process.version,
        memoryUsage: process.memoryUsage().rss,
        execPath: process.execPath,
        pid: process.pid,
        cwd: process.cwd(),
        numCPUs: numCPUs,
    }
    console.log(processInfo);
}

function getHtmlProcessInfo() {
    const htmlInfo =
        "<h1>Información de la aplicación</h1>" +
        "<div style='display: flex; flex-direction: column'>" +
        "<span>Argumentos de entrada: -p (puerto), -m (modo: FORK - CLUSTER)</span>" +
        `<span>Nombre de la plataforma: ${process.platform}</span>` +
        `<span>Versión de node.js: ${process.version}</span>` +
        `<span>Memoria total reservada (rss): ${process.memoryUsage().rss}</span>` +
        `<span>Path de ejecución:  ${process.execPath}</span>` +
        `<span>Process id: ${process.pid}</span>` +
        `<span>Carpeta del proyecto: ${process.cwd()}</span>` +
        `<span>Número de procesadores: ${numCPUs}</span>` +
        "</div>"

    return htmlInfo;
}

export default { getProcessInfo, getHtmlProcessInfo };