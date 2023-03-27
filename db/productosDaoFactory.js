import ProductosDao from "./productosDao.js";

const opcion = process.argv[2] || 'SQL';
let dao;

switch (opcion) {
    case 'SQL':
        dao = new ProductosDao();
        break;
}

class ProductosDaoFactory {
    static getDao() {
        return dao;
    }
}

export default ProductosDaoFactory;