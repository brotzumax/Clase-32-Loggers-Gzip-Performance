import ClienteSQL from "./sqlContainer.js";

class ProductosDao {
    constructor() {
        this.clienteSQL = ClienteSQL.getInstance("productos");
    }

    async getAll() {
        try {
            await this.clienteSQL.newKnex();
            const productos = [];
            const rows = await this.clienteSQL.knex.from(this.clienteSQL.tableName).select("*");
            for (let row of rows) {
                productos.push({ title: row['title'], price: row['price'], thumbnail: row['thumbnail'] });
            };
            return productos;
        } catch (error) {
            console.log(error);
        } finally {
            await this.clienteSQL.destroyKnex();
        }
    }

    async add(producto) {
        try {
            await this.clienteSQL.newKnex();
            await this.clienteSQL.knex(this.clienteSQL.tableName).insert(producto);
            console.log("Producto añadido con exito");
        } catch (error) {
            console.log(error);
        } finally {
            await this.clienteSQL.destroyKnex();
        }
    }

    async update(id, productoActualizado) {
        try {
            await this.clienteSQL.newKnex();
            await this.clienteSQL.knex(this.clienteSQL.tableName).where({ id }).update(productoActualizado);
            console.log("Producto actualizado con éxito");
        } catch (error) {
            console.log(error);
        } finally {
            await this.clienteSQL.destroyKnex();
        }
    }

    async delete(id) {
        try {
            await this.clienteSQL.newKnex();
            await this.clienteSQL.knex(this.clienteSQL.tableName).where({ id }).del();
            console.log("Producto eliminado con éxito");
        } catch (error) {
            console.log(error);
        } finally {
            await this.clienteSQL.destroyKnex();
        }
    }
}

export default ProductosDao;