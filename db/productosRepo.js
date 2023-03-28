import ProductosDao from "./productosDao.js";
import ProductosDaoFactory from "./productosDaoFactory.js";
import ProductoDTO from "./productosDto.js";

class ProductosRepo {
    constructor() {
        this.dao = new ProductosDao();
    }

    async getAll() {
        const dtos = [];
        const daos = await this.dao.getAll();
        if (daos) {
            for (let dao of daos) {
                dtos.push(new ProductoDTO(dao));
            }
        }
        return dtos;
    }

    async add(product) {
        const dto = new ProductoDTO(product);
        await this.dao.add(dto);
    }

    async update(title, newProduct) {
        const dto = new ProductoDTO(newProduct);
        await this.dao.update(title, dto);
    }
}

export default ProductosRepo;