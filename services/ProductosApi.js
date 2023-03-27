import ProductosRepo from "../db/productosRepo.js";

class ProductosApi {
    constructor() {
        this.productosRepo = new ProductosRepo();
    }

    async getProducts(product) {
        if (product) {
            await this.productosRepo.add(product);
        }
        const products = await this.productosRepo.getAll();
        return products;
    }
}

export default ProductosApi;