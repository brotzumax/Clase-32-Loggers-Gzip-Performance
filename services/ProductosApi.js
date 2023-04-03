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

    async updateProduct(data) {
        await this.productosRepo.update(data.oldTitle, data.newProduct);
    }

    async deleteProduct(title) {
        await this, this.productosRepo.delete(title);
    }
}

export default ProductosApi;