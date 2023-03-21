import ProductosDao from "../db/productosDao.js";

class ProductosApi {
    constructor() {
        this.productosDao = new ProductosDao();
    }

    async getProducts(product) {
        if (product) {
            await this.productosDao.add(product);
        }
        const products = await this.productosDao.getAll();
        return products;
    }
}

export default ProductosApi;