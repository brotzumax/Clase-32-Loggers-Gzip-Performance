import { ClienteSQL } from "../db/sqlContainer.js";

async function getProducts(product) {
    const sqlProductos = new ClienteSQL("productos");
    if (product) {
        await sqlProductos.insertarElemento(product);
    }
    const productos = await sqlProductos.obtenerProductos();
    return productos;
}

export default { getProducts };