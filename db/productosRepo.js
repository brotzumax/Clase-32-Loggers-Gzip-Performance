import ProductosDaoFactory from "./productosDaoFactory.js";
import ProductoDTO from "./productosDto.js";

class ProductosRepo {
    constructor() {
        this.dao = ProductosDaoFactory.getDao();
    }

    async getAll() {
        const dtos = [];
        for (let dao of await this.dao.getAll()) {
            dtos.push(new ProductoDTO(dao));
        }
        return dtos;
    }

    async add(product) {
        const dto = new ProductoDTO(product);
        await this.dao.add(dto);
    }
}

export default ProductosRepo;